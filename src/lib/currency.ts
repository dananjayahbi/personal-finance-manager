// Currency utilities and constants

export const DEFAULT_CURRENCY = 'LKR'
export const CURRENCY_SYMBOL = 'Rs.'

export const SUPPORTED_CURRENCIES = [
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs.' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

// Get currency symbol for a given currency code
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)
  return currency?.symbol || currencyCode
}

// Format amount with currency symbol
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const symbol = getCurrencySymbol(currencyCode)
  
  // For LKR, format with comma separators
  if (currencyCode === 'LKR') {
    return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  // For other currencies, use their standard formatting
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES: { [key: string]: number } = {
  'LKR': 1.00,        // Base currency
  'USD': 0.0031,      // 1 LKR = 0.0031 USD (approx 320 LKR per USD)
  'EUR': 0.0028,      // 1 LKR = 0.0028 EUR
  'GBP': 0.0024,      // 1 LKR = 0.0024 GBP
  'JPY': 0.46,        // 1 LKR = 0.46 JPY
  'CAD': 0.0043,      // 1 LKR = 0.0043 CAD
  'AUD': 0.0047,      // 1 LKR = 0.0047 AUD
  'CHF': 0.0027,      // 1 LKR = 0.0027 CHF
  'CNY': 0.022,       // 1 LKR = 0.022 CNY
  'INR': 0.26         // 1 LKR = 0.26 INR
}

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  
  // Convert from source currency to LKR (base)
  const lkrAmount = fromCurrency === 'LKR' ? amount : amount / EXCHANGE_RATES[fromCurrency]
  
  // Convert from LKR to target currency
  const convertedAmount = toCurrency === 'LKR' ? lkrAmount : lkrAmount * EXCHANGE_RATES[toCurrency]
  
  return Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
}

// Get current exchange rates (placeholder for real API integration)
export async function getExchangeRates(): Promise<{ [key: string]: number }> {
  // In a real app, this would fetch from a currency API like:
  // https://api.exchangerate-api.com/v4/latest/LKR
  return Promise.resolve(EXCHANGE_RATES)
}

// Update all amounts in the database when currency changes
export async function convertUserCurrency(
  userId: string, 
  fromCurrency: string, 
  toCurrency: string
): Promise<void> {
  if (fromCurrency === toCurrency) return
  
  try {
    // This would be implemented to:
    // 1. Get current exchange rates
    // 2. Convert all user's financial data (accounts, transactions, goals, bills)
    // 3. Update the database with converted amounts
    // 4. Update user's preferred currency
    
    console.log(`Converting user ${userId} data from ${fromCurrency} to ${toCurrency}`)
    
    // Placeholder for actual implementation
    // In a real app, this would make API calls to update all related records
  } catch (error) {
    console.error('Error converting user currency:', error)
    throw error
  }
}
