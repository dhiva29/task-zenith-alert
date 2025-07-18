import { PlacementInfo } from '@/types';

// Helper function to parse date from string
const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split(/[\.\-\/]/);
  if (parts.length === 3) {
    let [day, month, year] = parts;
    
    // Handle 2-digit years
    if (year.length === 2) {
      year = '20' + year;
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return !isNaN(date.getTime()) ? date : null;
  }
  return null;
};

// Helper function to parse date and time
const parseDateTime = (dateStr: string, timeStr: string): Date | null => {
  const date = parseDate(dateStr);
  if (!date) return null;
  
  // Parse time (e.g., "1.30 PM", "9 AM", "13:30")
  const timeMatch = timeStr.match(/([0-9]{1,2})(?:[\.:][0-9]{2})?\s*(AM|PM|am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeStr.includes('.') || timeStr.includes(':') ? 
      parseInt(timeStr.split(/[\.:]/)[1] || '0') : 0;
    const ampm = timeMatch[2]?.toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    date.setHours(hours, minutes, 0, 0);
  }
  
  return date;
};

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

  // Extract application deadline with time
  const applicationDeadlinePatterns = [
    /apply\s+(?:in\s+the\s+portal\s+)?by\s+([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})\s+at\s+([0-9]{1,2}(?:\.[0-9]{2})?\s*(?:AM|PM|am|pm))/i,
    /(?:deadline|last\s+date|submit\s+by)\s*:?\s*([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})\s+(?:at\s+)?([0-9]{1,2}(?:\.[0-9]{2})?\s*(?:AM|PM|am|pm))/i,
    /(?:before|by)\s+([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})\s+at\s+([0-9]{1,2}(?:\.[0-9]{2})?\s*(?:AM|PM|am|pm))/i
  ];

  for (const pattern of applicationDeadlinePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2]) {
      try {
        const dateStr = match[1];
        const timeStr = match[2];
        const date = parseDateTime(dateStr, timeStr);
        if (date) {
          result.deadline = date;
          break;
        }
      } catch (e) {
        console.error('Error parsing application deadline:', e);
      }
    }
  }

  // Extract pre-placement talk date and time
  const prePlacementPatterns = [
    /preplacement\s+talk\s*:?\s*([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})\s+time\s*:?\s*([0-9]{1,2}(?:\.[0-9]{2})?\s*(?:AM|PM|am|pm))/i,
    /(?:presentation|talk|session)\s*:?\s*([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})\s+(?:at\s+)?([0-9]{1,2}(?:\.[0-9]{2})?\s*(?:AM|PM|am|pm))/i
  ];

  for (const pattern of prePlacementPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2]) {
      try {
        const dateStr = match[1];
        const timeStr = match[2];
        const date = parseDateTime(dateStr, timeStr);
        if (date) {
          result.prePlacementTalk = date;
          break;
        }
      } catch (e) {
        console.error('Error parsing pre-placement talk date:', e);
      }
    }
  }

  // Fallback: Extract any date without time
  if (!result.deadline) {
    const simpleDatePatterns = [
      /(?:deadline|due|submit\s+by|last\s+date|apply\s+by)\s*:?\s*([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})/i,
      /(?:before|by)\s+([0-9]{1,2}[\.\-\/][0-9]{1,2}[\.\-\/][0-9]{2,4})/i
    ];

    for (const pattern of simpleDatePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        try {
          const dateStr = match[1];
          const date = parseDate(dateStr);
          if (date) {
            result.deadline = date;
            break;
          }
        } catch (e) {
          console.error('Error parsing simple date:', e);
        }
      }
    }
  }

  return result;
};