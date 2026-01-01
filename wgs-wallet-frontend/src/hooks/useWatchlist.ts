import { useCallback, useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { jsonFetch } from '../utils/api'

export function useWatchlist() {
  const [copySearch, setCopySearch] = useState<string>('')
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    (async () => {
      try {
        const resp = await jsonFetch<{ watchlist?: string[] }>(`/api/watchlist`)
        if (Array.isArray(resp.watchlist)) setWatchlist(resp.watchlist)
      } catch { /* ignore */ }
    })()
  }, [])

  const handleAddWatch = useCallback(async () => {
    try {
      const addr = copySearch.trim()
      const pk = new PublicKey(addr)
      const base58 = pk.toBase58()
      try {
        await jsonFetch(`/api/watchlist`, { method: 'POST', body: JSON.stringify({ address: base58 }) })
      } catch { /* ignore backend errors */ }
      if (!watchlist.includes(base58)) setWatchlist((w) => [...w, base58])
      setCopySearch('')
      setStatus('')
    } catch {
      setStatus('Invalid address. Paste a valid Solana public key (base58).')
      setTimeout(() => setStatus(''), 4000)
    }
  }, [copySearch, watchlist])

  const removeWatch = useCallback(async (addr: string) => {
    try { await jsonFetch(`/api/watchlist?address=${encodeURIComponent(addr)}`, { method: 'DELETE' }) } catch { /* ignore */ }
    setWatchlist((w) => w.filter((a) => a !== addr))
  }, [])

  return {
    copySearch,
    setCopySearch,
    watchlist,
    status,
    handleAddWatch,
    removeWatch,
  }
}




