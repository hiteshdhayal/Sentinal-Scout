import { Connection, PublicKey, SystemProgram, Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import * as bs58 from 'bs58'
import { config } from '../config/env'

/**
 * Intercepts fetch calls. If the server responds with 402 Payment Required,
 * extracts payment details from response headers, sends SOL to the payee,
 * and retries the original request with a payment proof header.
 */
export async function payAndFetch(url: string, options: RequestInit): Promise<Response> {
  const initialResponse = await fetch(url, options)

  if (initialResponse.status !== 402) {
    return initialResponse
  }

  // Extract payment details from x402 headers
  const payeeAddress = initialResponse.headers.get('x-payment-address')
  const amountLamports = initialResponse.headers.get('x-payment-amount-lamports')
  const paymentMemo = initialResponse.headers.get('x-payment-memo') ?? ''

  if (!payeeAddress || !amountLamports) {
    throw new Error('x402: Server returned 402 but missing payment headers (x-payment-address, x-payment-amount-lamports)')
  }

  const rpcUrl = process.env['SOLANA_RPC'] ?? 'https://api.devnet.solana.com'
  const connection = new Connection(rpcUrl, 'confirmed')

  // Load payer keypair from env (base58 private key)
  const privateKeyB58 = process.env['WALLET_PRIVATE_KEY']
  if (!privateKeyB58) {
    throw new Error('x402: WALLET_PRIVATE_KEY env var required for micropayments')
  }
  const payer = Keypair.fromSecretKey(bs58.decode(privateKeyB58))

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: new PublicKey(payeeAddress),
      lamports: parseInt(amountLamports, 10),
    })
  )

  // Add memo if provided
  if (paymentMemo) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: payer.publicKey,
        lamports: 0,
      })
    )
  }

  const signature = await sendAndConfirmTransaction(connection, transaction, [payer])

  // Retry with payment proof
  const retryOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> ?? {}),
      'x-payment-signature': signature,
      'x-payment-address': config.WALLET_ADDRESS,
    },
  }

  return fetch(url, retryOptions)
}
