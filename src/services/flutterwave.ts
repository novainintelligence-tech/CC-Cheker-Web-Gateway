import crypto from 'crypto';
import fetch from 'node-fetch';
import { config } from '../config';
import { query } from '../db';

const FLW_BASE = config.flwSandbox ? 'https://api.flutterwave.com/v3' : 'https://api.flutterwave.com/v3';

export async function initPayment({ amount, currency = 'USD', customer = {}, tx_ref }: { amount: number; currency?: string; customer?: any; tx_ref?: string }) {
  if (!config.flwSecretKey || !config.flwPublicKey) {
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

export async function handleWebhook(event: any, signature?: string) {
  try {
    // If signature provided, validate it using HMAC-SHA256 of the raw body
    if (signature && config.flwSecretKey) {
      try {
        const expected = crypto.createHmac('sha256', config.flwSecretKey).update(JSON.stringify(event)).digest('hex');
        if (signature !== expected) {
          return { ok: false, message: 'invalid signature' };
        }
      } catch (err) {
        console.warn('signature check failed', err);
      }
    }

    const tx_id = event?.data?.id || event?.data?.transaction_id || event?.id;
    const tx_ref = event?.data?.tx_ref || event?.data?.meta?.tx_ref;
    if (!tx_id && !tx_ref) return { ok: false, message: 'no id' };

    let verification: any;
    if (tx_id) verification = await verifyTransaction(tx_id);
    else verification = { status: 'success', data: { status: 'successful', id: tx_ref } };

    const ref = tx_ref || verification?.data?.tx_ref || verification?.data?.id || (`unknown_${Date.now()}`);
    const status = (verification?.data?.status || 'unknown');

    await query('INSERT INTO payments (tx_ref, gateway, amount, currency, status, metadata) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tx_ref) DO UPDATE SET status = EXCLUDED.status, updated_at = now()', [ref, 'flutterwave', verification?.data?.amount || 0, verification?.data?.currency || 'USD', status, event]);

    // record analytics event
    await query('INSERT INTO analytics_events (event_type, payload) VALUES ($1,$2)', ['flutterwave_webhook', { ref, status }]);

    return { ok: true, status };
  } catch (err) {
    console.error('webhook handle error', err);
    return { ok: false, message: 'error' };
  }
}
