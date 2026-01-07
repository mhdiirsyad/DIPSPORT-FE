import { getNextNDays } from './dateHelpers'

export function getNext7Days() {
  return getNextNDays(7, true)
}

export default getNext7Days