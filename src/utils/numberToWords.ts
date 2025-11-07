/**
 * Converts a number to Indian currency words
 * @param num The number to convert
 * @returns String representation of the number in words (e.g., "Thirty Lakh only")
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero only';
  
  // Handle decimal part
  const parts = num.toString().split('.');
  const integerPart = parseInt(parts[0]);
  
  if (integerPart === 0) return 'Zero only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
  }
  
  function convertThreeDigits(n: number): string {
    if (n === 0) return '';
    let result = '';
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    
    if (hundreds > 0) {
      result = ones[hundreds] + ' Hundred';
      if (remainder > 0) result += ' ';
    }
    
    if (remainder > 0) {
      result += convertTwoDigits(remainder);
    }
    
    return result;
  }
  
  // Indian numbering system: Crore, Lakh, Thousand, Hundred
  let result = '';
  let n = integerPart;
  
  // Crores (10,000,000)
  if (n >= 10000000) {
    const crores = Math.floor(n / 10000000);
    result += convertThreeDigits(crores) + ' Crore ';
    n %= 10000000;
  }
  
  // Lakhs (100,000)
  if (n >= 100000) {
    const lakhs = Math.floor(n / 100000);
    result += convertTwoDigits(lakhs) + ' Lakh ';
    n %= 100000;
  }
  
  // Thousands (1,000)
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    result += convertTwoDigits(thousands) + ' Thousand ';
    n %= 1000;
  }
  
  // Hundreds
  if (n > 0) {
    result += convertThreeDigits(n);
  }
  
  return result.trim() + ' only';
}
