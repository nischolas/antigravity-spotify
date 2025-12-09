/**
 * Formats milliseconds into a human-readable time string (HH:MM format)
 * @param ms - Time in milliseconds
 * @returns Formatted string in the format "XXh YYm"
 */
export const formatMs = (ms: number): string => {
    const totalMinutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}h ${minutes
        .toString()
        .padStart(2, '0')}m`;
};
