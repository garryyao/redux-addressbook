import { combineReducers } from 'redux'
import addresses from './addresses'
import notifications from './notifications'

export default combineReducers({
  addresses,
  notifications
})