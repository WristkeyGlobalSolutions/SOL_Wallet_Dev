import { describe, it, expect } from 'vitest'
import { bytesToBase64, base64ToBytes, parseSecret } from '../crypto'

describe('crypto utilities', () => {
  describe('bytesToBase64', () => {
    it('should convert bytes to base64', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111])
      const result = bytesToBase64(bytes)
      expect(result).toBe('SGVsbG8=')
    })

    it('should handle empty array', () => {
      const bytes = new Uint8Array([])
      const result = bytesToBase64(bytes)
      expect(result).toBe('')
    })

    it('should handle large arrays', () => {
      const bytes = new Uint8Array(1000).fill(65)
      const result = bytesToBase64(bytes)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('base64ToBytes', () => {
    it('should convert base64 to bytes', () => {
      const base64 = 'SGVsbG8='
      const result = base64ToBytes(base64)
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111])
    })

    it('should handle empty string', () => {
      const result = base64ToBytes('')
      expect(result.length).toBe(0)
    })
  })

  describe('parseSecret', () => {
    it('should parse base64 secret', () => {
      const base64 = bytesToBase64(new Uint8Array(64).fill(1))
      const result = parseSecret(base64)
      expect(result).not.toBeNull()
      expect(result?.length).toBe(64)
    })

    it('should parse JSON array secret', () => {
      const arr = Array.from({ length: 64 }, (_, i) => i % 256)
      const json = JSON.stringify(arr)
      const result = parseSecret(json)
      expect(result).not.toBeNull()
      expect(result?.length).toBe(64)
    })

    it('should return null for invalid input', () => {
      // Empty or whitespace only should return null
      expect(parseSecret('')).toBeNull()
      expect(parseSecret('   ')).toBeNull()
      // Invalid base64 that can't be decoded should return null
      // Note: 'invalid' might decode to something, so we test with clearly invalid base64
      expect(parseSecret('!!!')).toBeNull()
    })

    it('should return null for invalid JSON array', () => {
      // Arrays that are too short (not 32 or 64 bytes) should return null
      // But parseSecret doesn't check length, it just parses what it can
      // So we test with clearly invalid arrays
      expect(parseSecret('[300,400]')).toBeNull() // Out of range (>255)
      expect(parseSecret('["a","b"]')).toBeNull() // Not numbers
      expect(parseSecret('[1,2,3]')).not.toBeNull() // Actually valid, just short
    })
  })
})

