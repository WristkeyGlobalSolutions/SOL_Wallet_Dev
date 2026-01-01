interface ReceiveCardProps {
  address: string
  receiveQr: string
  onCopy: (text: string) => void
}

export function ReceiveCard({ address, receiveQr, onCopy }: ReceiveCardProps) {
  return (
    <div className="card stack">
      <div className="label">Receive SOL</div>
      {!address ? (
        <div className="help">Create or import a wallet to receive funds.</div>
      ) : (
        <>
          <div className="kv">
            <div className="label">Your address</div>
            <div className="value" style={{ wordBreak: 'break-all' }}>{address}</div>
          </div>
          {receiveQr && (
            <img 
              src={receiveQr} 
              alt="Receive QR" 
              style={{ 
                width: 220, 
                height: 220, 
                imageRendering: 'pixelated', 
                borderRadius: 12, 
                border: '1px solid rgba(255,255,255,0.10)' 
              }} 
            />
          )}
          <div className="row">
            <button className="btn" onClick={() => onCopy(address)}>Copy address</button>
            <a 
              className="btn btn-secondary" 
              href={`https://explorer.solana.com/address/${address}?cluster=devnet`} 
              target="_blank" 
              rel="noreferrer"
            >
              View on Explorer
            </a>
          </div>
        </>
      )}
    </div>
  )
}




