import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isValid, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormat(date: any, formatStr: string, fallback: string = 'N/A') {
  if (!date) return fallback;
  try {
    let d: Date;
    if (typeof date === 'string') {
      // If it looks like HH:mm:ss, append a dummy date so it can be parsed
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(date)) {
        d = new Date(`1970-01-01T${date}`);
      } else {
        d = parseISO(date);
        if (!isValid(d)) {
          d = new Date(date);
        }
      }
    } else {
      d = new Date(date);
    }
    
    if (!isValid(d)) return fallback;
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
}
