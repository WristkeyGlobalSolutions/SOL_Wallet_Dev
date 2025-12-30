import { useCallback, useEffect, useMemo, useState } from 'react'
import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import { bytesToBase64, base64ToBytes, parseSecret } from '../utils/crypto'
import { jsonFetch } from '../utils/api'

export function useWallet() {
  const [secret, setSecret] = useState<string>('')
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('')

  const connection = useMemo(() => new Connection(clusterApiUrl('devnet'), 'confirmed'), [])
  const address = useMemo(() => keypair?.publicKey?.toBase58() || '', [keypair])

  const refreshBalance = useCallback(async () => {
    if (!keypair) return
    try {
      const resp = await jsonFetch<{ balanceSOL?: number; lamports?: number }>(`/api/balance/${keypair.publicKey.toBase58()}`)
      if (typeof resp.balanceSOL === 'number') setBalance(resp.balanceSOL)
      else if (typeof resp.lamports === 'number') setBalance(resp.lamports / LAMPORTS_PER_SOL)
      else throw new Error('bad-response')
    } catch {
      const lamports = await connection.getBalance(keypair.publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    }
  }, [connection, keypair])

  useEffect(() => {
    if (keypair) refreshBalance(); else setBalance(null)
  }, [keypair, refreshBalance])

  // Live balance updates: subscribe to account changes
  useEffect(() => {
    if (!keypair) return
    const publicKey = keypair.publicKey
    let subscriptionId: number | null = null
    ;(async () => {
      try {
        subscriptionId = await connection.onAccountChange(publicKey, (accountInfo) => {
          try {
            setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
          } catch {
            // no-op
          }
        }, 'confirmed')
      } catch {
        // best-effort: ignore subscription errors
      }
    })()
    return () => {
      if (subscriptionId !== null) {
        connection.removeAccountChangeListener(subscriptionId).catch(() => {})
      }
    }
  }, [connection, keypair])

  const handleCreate = useCallback(async () => {
    try {
      const resp = await jsonFetch<{ secretBase64?: string; pubkey?: string }>(`/api/wallet/create`, { method: 'POST', body: JSON.stringify({}) })
      if (resp.secretBase64) {
        const kp = Keypair.fromSecretKey(base64ToBytes(resp.secretBase64))
        setKeypair(kp)
        setSecret(resp.secretBase64)
      } else {
        const kp = Keypair.generate()
        setKeypair(kp)
        setSecret(bytesToBase64(kp.secretKey))
      }
    } catch {
      const kp = Keypair.generate()
      setKeypair(kp)
      setSecret(bytesToBase64(kp.secretKey))
    }
    setStatus('')
  }, [])

  const handleImport = useCallback(async () => {
    try {
      const bytes = parseSecret(secret)
      if (!bytes) throw new Error('parse')
      let kp: Keypair
      if (bytes.length === 64) kp = Keypair.fromSecretKey(bytes)
      else if (bytes.length === 32) kp = Keypair.fromSeed(bytes)
      else throw new Error('len')
      setKeypair(kp)
      setStatus('')
      try {
        await jsonFetch(`/api/wallet/import`, { method: 'POST', body: JSON.stringify({ input: secret }) })
      } catch { /* ignore backend import failure */ }
    } catch (e) {
      setStatus('Invalid key. Paste base64 64-byte secretKey or JSON array of 64 numbers (Solana CLI). 32-byte seed accepted.')
      setTimeout(() => setStatus(''), 5000)
    }
  }, [secret])

  async function pollSignature(signature: string, maxMs = 30000, intervalMs = 1500) {
    const started = Date.now()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value } = await connection.getSignatureStatuses([signature])
      const s = value[0]
      if (s?.confirmationStatus === 'confirmed' || s?.confirmationStatus === 'finalized') return true
      if (s?.err) throw new Error('Transaction failed')
      if (Date.now() - started > maxMs) return false
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  }

  const handleAirdrop = useCallback(async () => {
    if (!keypair) return
    try {
      setStatus('airdrop-pending')
      const resp = await jsonFetch<{ status?: string; jobId?: string; message?: string }>(`/api/airdrop`, {
        method: 'POST',
        body: JSON.stringify({ pubkey: keypair.publicKey.toBase58() }),
      })
      
      // If backend uses queue system, poll for job status
      if (resp.jobId) {
        setStatus('Airdrop queued, processing...')
        // Poll job status
        let attempts = 0
        const maxAttempts = 30 // 30 seconds max
        const pollJob = async () => {
          try {
            const jobStatus = await jsonFetch<{
              state: string
              result?: { signature?: string; explorerUrl?: string; status?: string }
              failedReason?: string
              progress?: number
            }>(`/api/airdrop/status/${resp.jobId}`)
            
            if (jobStatus.state === 'completed' && jobStatus.result) {
              if (jobStatus.result.signature) {
                setStatus('Airdrop confirmed')
              } else {
                setStatus(jobStatus.result.status || 'Airdrop completed')
              }
              await refreshBalance()
              return true
            } else if (jobStatus.state === 'failed') {
              setStatus(`Airdrop failed: ${jobStatus.failedReason || 'Unknown error'}`)
              return true
            } else if (jobStatus.progress) {
              setStatus(`Airdrop processing... ${jobStatus.progress}%`)
            }
            
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(pollJob, 1000)
            } else {
              setStatus('Airdrop taking longer than expected. Please refresh balance in a few seconds.')
            }
            return false
          } catch (e) {
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(pollJob, 1000)
            } else {
              setStatus('Airdrop may be delayed. Try refreshing balance in a few seconds.')
            }
            return false
          }
        }
        setTimeout(pollJob, 1000)
        return
      }
      
      if (resp.status) setStatus(resp.status)
      await refreshBalance()
    } catch {
      try {
        setStatus('Requesting airdrop...')
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
        const lamports = 1 * LAMPORTS_PER_SOL
        const signature = await connection.requestAirdrop(keypair.publicKey, lamports)
        const fastConfirm = connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
        const timed = Promise.race([
          fastConfirm,
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000)),
        ])
        try {
          await timed
          setStatus('Airdrop confirmed')
        } catch {
          setStatus('Taking longer than usual... waiting for confirmation')
          const ok = await pollSignature(signature, 45000, 1500)
          if (!ok) setStatus('Airdrop may be delayed. It should appear shortly; try Refresh in a few seconds.')
          else setStatus('Airdrop confirmed')
        }
        await refreshBalance()
      } catch (e: any) {
        if (String(e?.message || e).toLowerCase().includes('airdrop') || String(e).includes('429')) {
          try {
            setStatus('Retrying airdrop with smaller amount (0.25 SOL)...')
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
            const signature = await connection.requestAirdrop(keypair.publicKey, 0.25 * LAMPORTS_PER_SOL)
            await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
            setStatus('Airdrop confirmed (0.25 SOL)')
            await refreshBalance()
            return
          } catch {
            setStatus('Airdrop failed. Devnet faucet may be rate-limited. Try again later or use smaller amount.')
            return
          }
        }
        setStatus(`Airdrop failed: ${e?.message ?? e}`)
      }
    }
  }, [keypair, connection, refreshBalance])

  return {
    secret,
    setSecret,
    keypair,
    balance,
    status,
    address,
    handleCreate,
    handleImport,
    handleAirdrop,
    refreshBalance,
  }
}

