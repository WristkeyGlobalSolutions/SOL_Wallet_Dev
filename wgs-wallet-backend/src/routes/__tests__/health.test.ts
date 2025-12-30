import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import healthRouter from '../health.js'
import * as queues from '../../lib/queues.js'
import * as webhooks from '../../lib/webhooks.js'

// Mock the queue and webhook modules
vi.mock('../../lib/queues.js', () => ({
  getQueueStats: vi.fn().mockResolvedValue({
    airdrop: { active: 0, waiting: 0, completed: 0, failed: 0 },
    send: { active: 0, waiting: 0, completed: 0, failed: 0 },
    timestamp: new Date().toISOString()
  })
}))

vi.mock('../../lib/webhooks.js', () => ({
  getWebhookStats: vi.fn().mockReturnValue({
    total: 0,
    active: 0
  })
}))

const app = express()
app.use(express.json())
app.use('/api/health', healthRouter)

describe('Health Route', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status')
    expect(response.body.status).toBe('ok')
  })
})

