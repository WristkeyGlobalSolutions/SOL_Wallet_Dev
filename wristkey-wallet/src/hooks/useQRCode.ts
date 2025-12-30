import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function useQRCode(address: string) {
  const [receiveQr, setReceiveQr] = useState<string>('')

  useEffect(() => {
    (async () => {
      if (!address) { setReceiveQr(''); return }
      try {
        const dataUrl = await QRCode.toDataURL(`solana:${address}`)
        setReceiveQr(dataUrl)
      } catch {
        try {
          const dataUrl = await QRCode.toDataURL(address)
          setReceiveQr(dataUrl)
        } catch { setReceiveQr('') }
      }
    })()
  }, [address])

  return receiveQr
}




