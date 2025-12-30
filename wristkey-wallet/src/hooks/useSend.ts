import { useCallback, useState } from 'react'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js'
import { jsonFetch } from '../utils/api'

interface UseSendProps {
  keypair: Keypair | null
  secret: string
  connection: Connection
  onRefreshBalance: () => void
}

export function useSend({ keypair, secret, connection, onRefreshBalance }: UseSendProps) {
  const [toAddress, setToAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('0.1')
  const [sig, setSig] = useState<string>('')
  const [explorerUrl, setExplorerUrl] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const handleSend = useCallback(async () => {
    try {
      if (!keypair) return
      const payload = {
        fromSecretBase64: secret,
        toPubkey: toAddress,
        amountSOL: parseFloat(amount || '0'),
      }
      const resp = await jsonFetch<{ signature?: string; explorerUrl?: string }>(`/api/send`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (resp.signature) setSig(resp.signature)
      if (resp.explorerUrl) setExplorerUrl(resp.explorerUrl)
      setStatus('Transfer submitted')
      await onRefreshBalance()
    } catch {
      try {
        if (!keypair) return
        const sender = keypair as Keypair
        const to = new PublicKey(toAddress)
        const lamports = Math.floor(parseFloat(amount || '0') * LAMPORTS_PER_SOL)
        const ix = SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: to, lamports })
        const tx = new Transaction().add(ix)
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = sender.publicKey
        tx.sign(sender)
        const signature = await connection.sendRawTransaction(tx.serialize())
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
        setSig(signature)
        setExplorerUrl(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
        await onRefreshBalance()
        setStatus('Transfer confirmed')
      } catch (e: any) {
        setStatus(`Transfer failed: ${e?.message ?? e}`)
      }
    }
  }, [keypair, secret, toAddress, amount, connection, onRefreshBalance])

  return {
    toAddress,
    setToAddress,
    amount,
    setAmount,
    sig,
    explorerUrl,
    status,
    handleSend,
  }
}

