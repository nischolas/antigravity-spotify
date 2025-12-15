/**
 * Formats milliseconds into a human-readable time string
 * @param ms - Time in milliseconds
 * @returns Formatted string in the format "XXh YYm"
 */
export const formatMs = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(1, "0")}h ${minutes.toString().padStart(2, "0")}m`;
};

export const formatMsPlain = (ms: number) => {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes };
};

export const formatDurationDDHHMM = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${days.toString().padStart(2, "0")}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
};
