import fetch from 'node-fetch';
import { config } from '../config';
import { query } from '../db';

const FLW_BASE = config.flwSandbox ? 'https://api.flutterwave.com/v3' : 'https://api.flutterwave.com/v3';

export async function initPayment({ amount, currency = 'USD', customer = {}, tx_ref }: { amount: number; currency?: string; customer?: any; tx_ref?: string }) {
  if (!config.flwSecretKey || !config.flwPublicKey) {
    // sandbox simulation
    const simulatedRef = tx_ref || `ccg_sim_${Date.now()}`;
    return { status: 'success', data: { link: `https://flutterwave.com/pay/${simulatedRef}`, tx_ref: simulatedRef } };
  }

  const payload = {
    tx_ref: tx_ref || `ccg_${Date.now()}`,
    amount: amount.toString(),
    currency,
    redirect_url: '',
    customer,
    payment_options: 'card'
  };

  const res = await fetch(`${FLW_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.flwSecretKey}`
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return json;
}

export async function verifyTransaction(transactionId: string) {
  if (!config.flwSecretKey) {
    return { status: 'success', data: { id: transactionId, status: 'successful' } };
  }

  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${config.flwSecretKey}` }
  });
  const json = await res.json();
  return json;
}

export async function handleWebhook(event: any) {
  // event is the body of the webhook from Flutterwave
  // Try to extract transaction id and verify
  try {
    const tx_id = event?.data?.id || event?.data?.transaction_id || event?.id;
    const tx_ref = event?.data?.tx_ref || event?.data?.meta?.tx_ref;
    if (!tx_id && !tx_ref) return { ok: false, message: 'no id' };

    // Verify via API if we have secret key
    let verification: any;
    if (tx_id) verification = await verifyTransaction(tx_id);
    else verification = { status: 'success', data: { status: 'successful', id: tx_ref } };

    // Persist to payments table if tx_ref available
    const ref = tx_ref || verification?.data?.id || (`unknown_${Date.now()}`);
    const status = (verification?.data?.status || 'unknown');

    await query('INSERT INTO payments (tx_ref, gateway, amount, currency, status, metadata) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tx_ref) DO UPDATE SET status = EXCLUDED.status, updated_at = now()', [ref, 'flutterwave', verification?.data?.amount || 0, verification?.data?.currency || 'USD', status, event]);

    return { ok: true, status };
  } catch (err) {
    console.error('webhook handle error', err);
    return { ok: false, message: 'error' };
  }
}
