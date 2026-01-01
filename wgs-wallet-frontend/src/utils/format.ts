import { PublicKey } from '@solana/web3.js'

export function formatPubkeyStr(s?: string): string {
  if (!s) return ''
  return `${s.slice(0, 4)}...${s.slice(-4)}`
}

export function formatPubkey(key?: PublicKey | null): string {
  return key ? formatPubkeyStr(key.toBase58()) : ''
}




