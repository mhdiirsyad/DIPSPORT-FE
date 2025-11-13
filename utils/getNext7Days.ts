export function getNext7Days() {
  const today = new Date()
  // Get the current hour
  const currentHour = today.getHours();

  // Create a new Date object for today, setting only the hour and zeroing out minutes, seconds, and milliseconds
  const todayAtCurrentHour = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    currentHour,
    0, // minutes
    0, // seconds
    0  // milliseconds
  );
  const days = []

  const date = new Date(todayAtCurrentHour)
  for(let i = 1; i<=7; i++) {
    date.setDate(date.getDate() + 1)
    days.push({
      label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: date.toISOString(),
    })
  }
  return days
}