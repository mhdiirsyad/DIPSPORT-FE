export function getNext7Days() {
  const days = []

  const today = new Date()
  const currentYear = today.getUTCFullYear()
  const currentMonth = today.getUTCMonth()
  const currentDate = today.getUTCDate()

  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(Date.UTC(currentYear, currentMonth, currentDate + i, 0, 0, 0, 0))
    
    days.push({
      label: futureDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
      value: futureDate.toISOString(), // Format: YYYY-MM-DDT00:00:00.000Z
    })
  }
  
  return days
}