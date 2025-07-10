import { PlacementInfo } from '@/types';

export const extractPlacementInfo = (text: string): Partial<PlacementInfo> => {
  const result: Partial<PlacementInfo> = {};
  
  // Common patterns for company names
  const companyPatterns = [
    /(?:company|organization|corp|corporation|ltd|limited|inc|pvt)\s*:?\s*([^\n\r,]+)/i,
    /(?:hiring|recruitment)\s+(?:at|for|by)\s+([^\n\r,]+)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|hiring|recruiting)/i,
    /position\s+at\s+([^\n\r,]+)/i
  ];

  // Try to extract company name
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.companyName = match[1].trim();
      break;
    }
  }

  // Extract job role
  const rolePatterns = [
    /(?:role|position|job)\s*:?\s*([^\n\r,]+)/i,
    /(?:for|as)\s+(?:a\s+)?([^\n\r,]+?)(?:\s+(?:role|position))/i,
    /hiring\s+for\s+([^\n\r,]+)/i
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.jobRole = match[1].trim();
      break;
    }
  }

  // Extract CTC/LPA
  const ctcPatterns = [
    /(?:ctc|salary|package)\s*:?\s*([0-9.]+\s*(?:lpa|lakhs?|l))/i,
    /([0-9.]+\s*(?:lpa|lakhs?))/i,
    /package\s*(?:of\s*)?([0-9.]+)/i
  ];

  for (const pattern of ctcPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.ctcLpa = match[1].trim();
      break;
    }
  }

  // Extract deadline
  const datePatterns = [
    /(?:deadline|due|submit\s+by|last\s+date)\s*:?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /(?:before|by)\s+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1];
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
          let [day, month, year] = parts;
          
          // Handle 2-digit years
          if (year.length === 2) {
            year = '20' + year;
          }
          
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(date.getTime())) {
            result.deadline = date;
          }
        }
      } catch (e) {
        console.error('Error parsing date:', e);
      }
      break;
    }
  }

  return result;
};