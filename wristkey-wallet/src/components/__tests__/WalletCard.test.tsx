import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalletCard } from '../WalletCard'
import { Keypair } from '@solana/web3.js'

describe('WalletCard', () => {
  const mockProps = {
    keypair: null,
    secret: '',
    balance: null,
    status: '',
    onSecretChange: vi.fn(),
    onCreate: vi.fn(),
    onImport: vi.fn(),
    onRefresh: vi.fn(),
    onAirdrop: vi.fn(),
  }

  it('should render wallet card', () => {
    render(<WalletCard {...mockProps} />)
    expect(screen.getByText('Create Wallet')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
    expect(screen.getByText('Airdrop 1 SOL')).toBeInTheDocument()
  })

  it('should display balance when available', () => {
    render(<WalletCard {...mockProps} balance={1.5} />)
    expect(screen.getByText('1.5 SOL')).toBeInTheDocument()
  })

  it('should display address when keypair is available', () => {
    const keypair = Keypair.generate()
    render(<WalletCard {...mockProps} keypair={keypair} />)
    const addressElement = screen.getByText(/\.\.\./)
    expect(addressElement).toBeInTheDocument()
  })

  it('should call onCreate when Create Wallet button is clicked', () => {
    const onCreate = vi.fn()
    render(<WalletCard {...mockProps} onCreate={onCreate} />)
    screen.getByText('Create Wallet').click()
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('should display status message when provided', () => {
    render(<WalletCard {...mockProps} status="Test status message" />)
    expect(screen.getByText('Test status message')).toBeInTheDocument()
  })
})




