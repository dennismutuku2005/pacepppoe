/**
 * Nairobi (EAT, UTC+3) Date & Time Formatting Utilities
 * All timestamps and date strings across the application are formatted
 * strictly according to the Africa/Nairobi timezone.
 */

export const NAIROBI_TIMEZONE = 'Africa/Nairobi';

/**
 * Safely parses any date/string input into a Date object assuming Nairobi timezone if offset is omitted
 * @param {string|number|Date} dateInput
 * @returns {Date|null}
 */
export function parseNairobiDate(dateInput) {
    if (!dateInput) return null;
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

    let str = String(dateInput).trim();
    if (!str || str === '0000-00-00 00:00:00' || str === '0000-00-00') return null;

    // If format is YYYY-MM-DD HH:mm:ss without timezone offset, append +03:00 to parse as East Africa Time
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(str)) {
        str = str.replace(' ', 'T') + '+03:00';
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        str = str + 'T00:00:00+03:00';
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats time in Nairobi timezone (e.g., "04:15 PM")
 * @param {string|number|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatNairobiTime(dateInput, options = {}) {
    const d = parseNairobiDate(dateInput);
    if (!d) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: NAIROBI_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...options
    }).format(d);
}

/**
 * Formats date in Nairobi timezone (e.g., "27 Sep 2026")
 * @param {string|number|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatNairobiDate(dateInput, options = {}) {
    const d = parseNairobiDate(dateInput);
    if (!d) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: NAIROBI_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options
    }).format(d);
}

/**
 * Formats date & time in Nairobi timezone (e.g., "27 Sep 2026, 04:15 PM")
 * @param {string|number|Date} dateInput
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatNairobiDateTime(dateInput, options = {}) {
    const d = parseNairobiDate(dateInput);
    if (!d) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: NAIROBI_TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        ...options
    }).format(d);
}

/**
 * Relative time ago relative to now (e.g., "2m ago", "1h ago", "Today at 04:15 PM")
 * @param {string|number|Date} dateInput
 * @returns {string}
 */
export function formatNairobiRelative(dateInput) {
    const d = parseNairobiDate(dateInput);
    if (!d) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45 && diffSec >= -10) return 'Just now';
    if (diffMin < 60 && diffMin >= 0) return `${diffMin}m ago`;
    if (diffHour < 24 && diffHour >= 0) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay > 1 && diffDay < 7) return `${diffDay}d ago`;

    return formatNairobiDate(d);
}
