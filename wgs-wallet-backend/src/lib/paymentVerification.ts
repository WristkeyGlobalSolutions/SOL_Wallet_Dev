import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { connection, LAMPORTS_PER_SOL, PublicKey } from './solana.js';
import { db } from '../db.js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

const WGS_WALLET_ADDRESS = process.env.WGS_WALLET_ADDRESS || '5JoUMnajtdG3tuLP7yocp2u4oTJ4ihV8AdNkENoveVfP';

// Function to parse memo
const parseMemo = (memo: string | null) => {
  if (!memo || !memo.startsWith('WGS:')) {
    return { is_donation: true };
  }

  const parts = memo.split(':');
  if (parts.length !== 4) {
    return { is_donation: true };
  }

  const [, user_id, service_name, duration] = parts;
  return { is_donation: false, user_id, service_name, duration };
};

// Payment Verification Worker
new Worker('payment-verification', async (job: Job) => {
  const { signature } = job.data;

  try {
    const tx = await connection.getParsedTransaction(signature, 'confirmed');

    if (tx && tx.meta && !tx.meta.err) {
      const { transaction, meta } = tx;
      const instruction = transaction.message.instructions.find(
        (inst) => 'parsed' in inst && inst.parsed.type === 'transfer' && inst.parsed.info.destination === WGS_WALLET_ADDRESS
      );

      if (instruction && 'parsed' in instruction) {
        const { source, destination, lamports } = instruction.parsed.info;
        const amount_sol = lamports / LAMPORTS_PER_SOL;
        const memo = (transaction.message.instructions.find(
          (inst) => 'parsed' in inst && inst.program === 'spl-memo'
        ) as any)?.parsed.info.memo as string || null;

        const { is_donation, user_id, service_name, duration } = parseMemo(memo);

        // Check for duplicate transaction
        const existingPayment = db.prepare('SELECT signature FROM payments WHERE signature = ?').get(signature);
        if (existingPayment) {
          console.log(`Duplicate transaction found: ${signature}`);
          return;
        }

        db.prepare(
          'INSERT INTO payments (signature, sender, recipient, amount_sol, memo, is_donation, user_id, service_name, duration, timestamp, status)'
        ).run(
          signature,
          source,
          destination,
          amount_sol,
          memo,
          is_donation ? 1 : 0,
          user_id,
          service_name,
          duration,
          tx.blockTime ? tx.blockTime * 1000 : Date.now(),
          'verified'
        );

        console.log(`Payment verified and logged: ${signature}`);
      }
    }
  } catch (error) {
    console.error(`Failed to verify payment for signature ${signature}:`, error);
    throw error;
  }
}, { connection: redis });

// Polling for new transactions
const pollForTransactions = async () => {
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(WGS_WALLET_ADDRESS), { limit: 25 });
    for (const { signature } of signatures) {
        // Add to queue for processing
        const job = await new (require('bullmq')).Queue('payment-verification', { connection: redis }).add('verify', { signature }, {
            removeOnComplete: true,
            removeOnFail: true,
            jobId: signature // Use signature as job ID to prevent duplicates
        });
    }
  } catch (error) {
    console.error('Error polling for transactions:', error);
  }
};

// Start polling every 30 seconds
setInterval(pollForTransactions, 30000);

console.log('Payment verification worker started.');
