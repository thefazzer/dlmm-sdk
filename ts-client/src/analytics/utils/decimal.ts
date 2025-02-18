

import { Decimal } from 'decimal.js';

export const configureDecimal = () => {
  Decimal.set({
    precision: 20,
    rounding: Decimal.ROUND_HALF_UP,
    toExpNeg: -7,
    toExpPos: 21,
    maxE: 9e15,
    minE: -9e15,
  });
};