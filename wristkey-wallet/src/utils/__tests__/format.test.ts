import { describe, it, expect } from 'vitest'
import { PublicKey } from '@solana/web3.js'
import { formatPubkeyStr, formatPubkey } from '../format'

describe('format utilities', () => {
  describe('formatPubkeyStr', () => {
    it('should format a valid public key string', () => {
      const key = '11111111111111111111111111111111'
      const result = formatPubkeyStr(key)
      expect(result).toBe('1111...1111')
    })

    it('should return empty string for undefined', () => {
      const result = formatPubkeyStr(undefined)
      expect(result).toBe('')
    })

    it('should return empty string for empty string', () => {
      const result = formatPubkeyStr('')
      expect(result).toBe('')
    })

    it('should handle short strings', () => {
      const key = '123'
      const result = formatPubkeyStr(key)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('formatPubkey', () => {
    it('should format a PublicKey object', () => {
      const pubkey = new PublicKey('11111111111111111111111111111111')
      const result = formatPubkey(pubkey)
      expect(result).toBe('1111...1111')
    })

    it('should return empty string for null', () => {
      const result = formatPubkey(null)
      expect(result).toBe('')
    })

    it('should return empty string for undefined', () => {
      const result = formatPubkey(undefined)
      expect(result).toBe('')
    })
  })
})




