/**
 * Formats the given milliseconds into a string of this format: "HH:MM:SS:MSS".
 * @param ms
 * @param showMilliseconds
 */
export function formatTime(ms: number, showMilliseconds = true): string {
  const milliseconds = ms % 1000;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (60 * 1000)) % 60);
  const hours = Math.floor((ms / (3600 * 1000)) % 3600);

  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}${
    showMilliseconds ? `.${milliseconds}` : ''
  }`;
}
