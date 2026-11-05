/**
 * NOVARA Haute Couture & Luxury Goods
 * Standardized Date & Time Utility for Indian Standard Time (IST - Asia/Kolkata)
 */

/**
 * Formats a date/timestamp into "DD MMM YYYY, hh:mm AM/PM IST"
 * Example: "05 Nov 2026, 03:54 PM IST"
 *
 * @param {string|Date|number} dateInput - Raw date, ISO string, or timestamp
 * @returns {string} Formatted date string in IST
 */
export const formatOrderDateTimeIST = (dateInput) => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toUpperCase();

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
  } catch {
    // Fallback if Intl is unavailable or fails
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  }
};

/**
 * Formats a date into "DD MMM YYYY" in IST
 * Example: "05 Nov 2026"
 */
export const formatOrderDateIST = (dateInput) => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';

    return `${day} ${month} ${year}`;
  } catch {
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  }
};

/**
 * Formats a time into "hh:mm AM/PM IST"
 * Example: "03:54 PM IST"
 */
export const formatOrderTimeIST = (dateInput) => {
  if (!dateInput) return '—';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const parts = formatter.formatToParts(date);
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toUpperCase();

    return `${hour}:${minute} ${dayPeriod} IST`;
  } catch {
    return date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  }
};

