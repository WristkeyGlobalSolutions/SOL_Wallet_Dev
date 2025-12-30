export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const sub = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...Array.from(sub))
  }
  return btoa(binary)
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function parseSecret(inputRaw: string): Uint8Array | null {
  const input = (inputRaw || '').trim()
  if (!input) return null
  if (input.startsWith('[') && input.endsWith(']')) {
    try {
      const arr = JSON.parse(input)
      if (!Array.isArray(arr)) return null
      const nums = arr.map((n: any) => Number(n))
      if (nums.some((n: any) => !Number.isFinite(n) || n < 0 || n > 255)) return null
      return new Uint8Array(nums)
    } catch {
      return null
    }
  }
  try {
    return base64ToBytes(input)
  } catch {
    return null
  }
}




