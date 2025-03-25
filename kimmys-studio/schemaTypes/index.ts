import meal from './meal'
import combo from './combo'
import order from './orders'
import settings from './settings'
import paymentSettings from './paymentSettings'
import pickupSettings from './pickupSettings'
import openingHours from './openingHours' // Must be imported

export const schemaTypes = [
  meal,
  combo,
  order,
  settings,
  paymentSettings,
  pickupSettings,
  openingHours // Must be included in exports
]