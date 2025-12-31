interface Slot {
  start: string
  end: string
  hour: number
  status: 'Available' | 'Booked'
  price: number
  previousPrice?: number | null
  highlight?: boolean
}

export function generateTimeSlots(
  startHour = 8,
  endHour = 22,
  // HARGA DISEMBUNYIKAN: Default pricePerHour set ke 0
  pricePerHour = 0, // 100000,
  bookedSlots: number[] = []
): Slot[] {
  const slots: Slot[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`
    const isBooked = bookedSlots.includes(hour)
    slots.push({
      start: start,
      end: end,
      hour,
      // HARGA DISEMBUNYIKAN: price set ke 0
      price: 0, // pricePerHour,
      // HARGA DISEMBUNYIKAN: previousPrice dikomentari
      // previousPrice: Math.random() > 0.7 ? pricePerHour + 20000 : null,
      previousPrice: null,
      highlight: Math.random() > 0.8,
      status: isBooked ? 'Booked' : 'Available'
    })
  }
  return slots
}

export type {Slot}