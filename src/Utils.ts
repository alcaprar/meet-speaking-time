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

  let timeStr = '';
  if (hours) {
    timeStr += `${hours}:`;
  }
  if (timeStr !== '' || minutes) {
    if (timeStr) {
      timeStr += minutes < 10 ? '0' + minutes : minutes;
    } else {
      timeStr += minutes;
    }
    timeStr += ':';
  }
  if (timeStr !== '' || seconds) {
    if (timeStr) {
      timeStr += seconds < 10 ? '0' + seconds : seconds;
    } else {
      timeStr += seconds;
    }
  }
  if (showMilliseconds) {
    timeStr += `.${milliseconds}`;
  }
  return timeStr;
}
