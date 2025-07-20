import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { intervalToDuration, formatDuration } from 'date-fns'

export const MAX_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const humanToSeconds = (unit: string, value: number | string) => {
    switch (unit) {
        case 'seconds':
            return Number(value);
        case 'minutes':
            return Number(value) * 60;
        case 'hours':
            return Number(value) * 3600;
        case 'days':
            return Number(value) * 86400;
        case 'weeks':
            return Number(value) * 604800;
        case 'months':
            return Number(value) * 2592000; // Approximation: 30 days
        case 'years':
            return Number(value) * 31536000; // Approximation: 365 days
        case 'lifetime':
            return 1;
        default:
            throw new Error(`Unknown unit: ${unit}`);
    }
}

export const secondsToHuman = (seconds: number) => {
    return formatDuration(intervalToDuration({ start: 0, end: seconds * 1000 }));
}