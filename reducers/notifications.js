import {NOTIFY_USER} from '../constants/ActionTypes'

const messages = [];

export default function notification(state = messages, action) {
  switch (action.type) {
  case NOTIFY_USER:
    const timestamp = Date.now(), message = action.message;
    return [
      {timestamp, message},
      ...state
    ];
  
  default:
    return state
  }
}
