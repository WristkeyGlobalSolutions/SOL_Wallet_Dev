import { useCallback, useState } from 'react'

export function useClipboard() {
  const [status, setStatus] = useState<string>('')

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text)
      setStatus('Copied to clipboard')
      setTimeout(() => setStatus(''), 1500)
    } catch {}
  }, [])

  return { handleCopy, copyStatus: status }
}




