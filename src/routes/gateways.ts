import { Router } from 'express';

const router = Router();

// Return a list of simulated gateways (50+)
const GATEWAYS = [
  'Flutterwave', 'Stripe', 'PayPal', 'Authorize.Net', 'Square', 'Braintree', 'Adyen', 'Worldpay', 'Paystack', 'Razorpay',
  '2Checkout', 'KoboPay', 'Skrill', 'Neteller', 'Alipay', 'WeChatPay', 'PayU', 'Klarna', 'Afterpay', 'MercadoPago',
  'Payoneer', 'BlueSnap', 'Mollie', 'FiberPay', 'Paysafe', 'Verifone', 'Fiserv', 'Global Payments', 'NMI', 'Elavon',
  'CyberSource', 'Ingenico', 'Opayo', 'Worldline', 'Checkout.com', 'YapStone', 'SquareUp', 'Paytrail', 'Midtrans', 'Gerencianet',
  'Tink', 'GoPay', 'DLocal', 'Satispay', 'ECPay', 'Hipay', 'Moneris', 'OXXO', 'Shetab', 'POLi', 'M-Pesa', 'iDEAL'
];

router.get('/', async (req, res) => {
  res.json({ gateways: GATEWAYS, count: GATEWAYS.length });
});

export default router;
