// card validator service

export function luhnCheck(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
}

export function maskCard(cardNumber: string): string {
  const s = cardNumber.replace(/\D/g, '');
  if (s.length <= 4) return s;
  return '*'.repeat(Math.max(0, s.length - 4)) + s.slice(-4);
}

export function getBinInfo(cardNumber: string) {
  const s = cardNumber.replace(/\D/g, '');
  const bin = s.slice(0, 6);
  // Simulated BIN lookup map
  const map: Record<string, any> = {
    '424242': { brand: 'Visa', country: 'US', type: 'credit' },
    '400005': { brand: 'Visa', country: 'US', type: 'debit' },
    '378282': { brand: 'American Express', country: 'US', type: 'credit' },
    '555555': { brand: 'Mastercard', country: 'US', type: 'credit' }
  };
  return map[bin] || { brand: 'Unknown', country: 'Unknown', type: 'Unknown', bin };
}
