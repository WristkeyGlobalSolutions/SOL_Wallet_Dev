import { formatPubkeyStr } from '../utils/format'

interface SendCardProps {
  toAddress: string
  amount: string
  sig: string
  explorerUrl: string
  keypair: any
  onToAddressChange: (address: string) => void
  onAmountChange: (amount: string) => void
  onSend: () => void
}

export function SendCard({
  toAddress,
  amount,
  sig,
  explorerUrl,
  keypair,
  onToAddressChange,
  onAmountChange,
  onSend,
}: SendCardProps) {
  return (
    <div className="card stack">
      <div className="label">Send SOL</div>
      <input 
        className="input" 
        placeholder="Recipient address" 
        value={toAddress} 
        onChange={(e) => onToAddressChange(e.target.value)} 
      />
      <div className="row">
        <input 
          className="input" 
          style={{ width: 180 }} 
          placeholder="Amount (SOL)" 
          value={amount} 
          onChange={(e) => onAmountChange(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={onSend} disabled={!keypair}>Send</button>
      </div>
      {sig && (
        <div className="kv">
          <div className="label">Recent tx</div>
          <a 
            className="link" 
            href={explorerUrl || `https://explorer.solana.com/tx/${sig}?cluster=devnet`} 
            target="_blank" 
            rel="noreferrer"
          >
            {formatPubkeyStr(sig)}
          </a>
        </div>
      )}
    </div>
  )
}




