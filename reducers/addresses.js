import {ADD_ADDR, DELETE_ADDR, EDIT_ADDR, RECEIVE_ADDRS} from '../constants/ActionTypes'

const initialState = [];

export default function addresses(state = initialState, action) {
  switch (action.type) {
  case ADD_ADDR:
    return [
      Object.assign({
        id: state.reduce((maxId, item) => Math.max(item.id, maxId), -1) + 1
      }, action.address),
      ...state
    ];
  
  case RECEIVE_ADDRS:
    return [...action.data];
  
  case DELETE_ADDR:
    return state.filter(item =>
      item.id !== action.id
    )
  
  case EDIT_ADDR:
    return state.map(item => item.id === action.id ? Object.assign({}, action.address) : item
    )

  default:
    return state
  }
}
