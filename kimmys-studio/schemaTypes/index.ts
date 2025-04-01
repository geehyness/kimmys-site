import meal from './meal'
import combo from './combo'
import order from './orders'
import settings from './settings'
import paymentSettings from './paymentSettings'
import pickupSettings from './pickupSettings'
import openingHours from './openingHours'
import category from './category'
import extra from './extra' // New extra schema

export const schemaTypes = [
  meal,
  combo,
  order,
  category,
  extra, // Include the new extra schema
  settings,
  paymentSettings,
  pickupSettings,
  openingHours
]
