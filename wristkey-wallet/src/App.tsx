import { useMemo } from 'react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import './App.css'
import { WalletCard } from './components/WalletCard'
import { SendCard } from './components/SendCard'
import { ReceiveCard } from './components/ReceiveCard'
import { WatchlistCard } from './components/WatchlistCard'
import { useWallet } from './hooks/useWallet'
import { useSend } from './hooks/useSend'
import { useWatchlist } from './hooks/useWatchlist'
import { useQRCode } from './hooks/useQRCode'
import { useClipboard } from './hooks/useClipboard'

function App() {
  const connection = useMemo(() => new Connection(clusterApiUrl('devnet'), 'confirmed'), [])

  const {
    secret,
    setSecret,
    keypair,
    balance,
    status: walletStatus,
    address,
    handleCreate,
    handleImport,
    handleAirdrop,
    refreshBalance,
  } = useWallet()

  const {
    toAddress,
    setToAddress,
    amount,
    setAmount,
    sig,
    explorerUrl,
    handleSend,
  } = useSend({ keypair, secret, connection, onRefreshBalance: refreshBalance })

  const {
    copySearch,
    setCopySearch,
    watchlist,
    handleAddWatch,
    removeWatch,
  } = useWatchlist()

  const receiveQr = useQRCode(address)
  const { handleCopy } = useClipboard()

  return (
    <div className="container">
      <div className="header">
        <div className="title">Wristkey Global Solutions Wallet</div>
        <div className="subtle">Cluster: devnet</div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <WatchlistCard
          copySearch={copySearch}
          watchlist={watchlist}
          onCopySearchChange={setCopySearch}
          onAddWatch={handleAddWatch}
          onCopy={handleCopy}
          onRemove={removeWatch}
        />

        <WalletCard
          keypair={keypair}
          secret={secret}
          balance={balance}
          status={walletStatus}
          onSecretChange={setSecret}
          onCreate={handleCreate}
          onImport={handleImport}
          onRefresh={refreshBalance}
          onAirdrop={handleAirdrop}
        />

        <SendCard
          toAddress={toAddress}
          amount={amount}
          sig={sig}
          explorerUrl={explorerUrl}
          keypair={keypair}
          onToAddressChange={setToAddress}
          onAmountChange={setAmount}
          onSend={handleSend}
        />

        <ReceiveCard
          address={address}
          receiveQr={receiveQr}
          onCopy={handleCopy}
        />
      </div>

      {/* Bottom-only CTA (appears when scrolled to bottom since it's in normal flow) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <a
          className="donate-cta"
          href={`https://explorer.solana.com/address/5JoUMnajtdG3tuLP7yocp2u4oTJ4ihV8AdNkENoveVfP?cluster=devnet`}
          target="_blank"
          rel="noreferrer"
          aria-label="Solana Donations"
        >
          Solana Donations
        </a>
      </div>
    </div>
  )
}

export default App
