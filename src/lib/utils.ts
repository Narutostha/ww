import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatter for Nepalese Rupees
export function formatNPR(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Convert price from NPR to display format
export function formatPrice(price: number) {
  return `${CURRENCY.symbol} ${price.toLocaleString('en-US')}`;
}

// Shipping cost calculation for Nepal
export function calculateShippingCost(total: number, region: string = 'Outside Valley') {
  // Free shipping over NPR 10000
  if (total >= 10000) return 0;
  
  // Base shipping cost
  return region === 'Kathmandu Valley' ? 200 : 300;
}

// Format number in standard format
export function formatNumber(num: number) {
  return num.toLocaleString('en-US');
}