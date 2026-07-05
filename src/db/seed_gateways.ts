import { query } from '../db';

const GATEWAYS = [
  'flutterwave','stripe','paypal','authorize_net','square','braintree','adyen','worldpay','paystack','razorpay',
  '2checkout','kobopay','skrill','neteller','alipay','wechatpay','payu','klarna','afterpay','mercadopago',
  'payoneer','bluesnap','mollie','fiberpay','paysafe','verifone','fiserv','global_payments','nmi','elavon',
  'cybersource','ingenico','opayo','worldline','checkout_com','yapstone','squareup','paytrail','midtrans','gerencianet',
  'tink','gopay','dlocal','satispay','ecpay','hipay','moneris','oxxo','shetab','poli','mpesa','ideal'
];

export async function seedGateways() {
  for (const name of GATEWAYS) {
    const slug = name.toLowerCase();
    try {
      await query('INSERT INTO gateways (name, slug, config, enabled) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING', [name, slug, {}, true]);
    } catch (err) {
      console.error('seed gateway error', name, err);
    }
  }
  console.log('Seeded gateways');
}

if (require.main === module) {
  seedGateways().then(()=>process.exit(0)).catch(()=>process.exit(1));
}
