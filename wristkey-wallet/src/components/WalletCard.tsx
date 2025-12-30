import { Keypair } from '@solana/web3.js'
import { formatPubkey } from '../utils/format'

interface WalletCardProps {
  keypair: Keypair | null
  secret: string
  balance: number | null
  status: string
  onSecretChange: (secret: string) => void
  onCreate: () => void
  onImport: () => void
  onRefresh: () => void
  onAirdrop: () => void
}

export function WalletCard({
  keypair,
  secret,
  balance,
  status,
  onSecretChange,
  onCreate,
  onImport,
  onRefresh,
  onAirdrop,
}: WalletCardProps) {
  return (
    <div className="card stack">
      <div className="row">
        <button className="btn btn-primary" onClick={onCreate}>Create Wallet</button>
        <button className="btn btn-secondary" onClick={onRefresh} disabled={!keypair}>Refresh</button>
        <button className="btn" onClick={onAirdrop} disabled={!keypair}>Airdrop 1 SOL</button>
      </div>

      <div className="kv">
        <div className="label">Address</div>
        <div className="value">{formatPubkey(keypair?.publicKey)}</div>
      </div>
      <div className="kv">
        <div className="label">Balance</div>
        <div className="value">{balance ?? '-'} SOL</div>
      </div>

      <div className="stack">
        <div className="label">Import key</div>
        <input 
          className="input" 
          placeholder="Base64 64-byte secret or JSON array of 64 numbers" 
          value={secret} 
          onChange={(e) => onSecretChange(e.target.value)} 
        />
        <div className="row">
          <button className="btn" onClick={onImport}>Import</button>
          <div className="help">Tip: After Create Wallet, the box contains importable base64.</div>
        </div>
      </div>
      {status && (
        <div className="warn">
          {status.endsWith('-pending') ? 'Airdrop requested, awaiting confirmation… (hit Refresh)' : status}
        </div>
      )}
    </div>
  )
}

