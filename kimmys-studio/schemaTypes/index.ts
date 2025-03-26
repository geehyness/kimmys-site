import meal from './meal'
import combo from './combo'
import order from './orders'
import settings from './settings'
import paymentSettings from './paymentSettings'
import pickupSettings from './pickupSettings'
import openingHours from './openingHours' // Must be imported
import category from './category'

export const schemaTypes = [
  meal,
  combo,
  order,
  category,
  settings,
  paymentSettings,
  pickupSettings,
  openingHours // Must be included in exports
]