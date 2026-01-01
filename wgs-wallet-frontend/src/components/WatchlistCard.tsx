import { formatPubkeyStr } from '../utils/format'

interface WatchlistCardProps {
  copySearch: string
  watchlist: string[]
  onCopySearchChange: (search: string) => void
  onAddWatch: () => void
  onCopy: (text: string) => void
  onRemove: (addr: string) => void
}

export function WatchlistCard({
  copySearch,
  watchlist,
  onCopySearchChange,
  onAddWatch,
  onCopy,
  onRemove,
}: WatchlistCardProps) {
  return (
    <div className="card stack">
      <div className="label">Copy trading wallets</div>
      <div className="row">
        <input 
          className="input" 
          placeholder="Search or paste wallet address" 
          value={copySearch} 
          onChange={(e) => onCopySearchChange(e.target.value)} 
        />
        <button className="btn btn-primary" onClick={onAddWatch}>Add</button>
      </div>
      <div className="stack">
        {watchlist.length === 0 ? (
          <div className="help">No wallets added yet. Paste an address and click Add.</div>
        ) : (
          watchlist.map((addr) => (
            <div key={addr} className="row-between">
              <div className="value">{formatPubkeyStr(addr)}</div>
              <div className="row">
                <button className="btn" onClick={() => onCopy(addr)}>Copy</button>
                <a 
                  className="btn btn-secondary" 
                  href={`https://explorer.solana.com/address/${addr}?cluster=devnet`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  View
                </a>
                <button className="btn btn-danger" onClick={() => onRemove(addr)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}




