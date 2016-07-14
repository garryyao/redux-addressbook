import * as types from '../constants/ActionTypes'

export function newAddr(address) {
  return {type: types.ADD_ADDR, address}
}

export function deleteAddr(id) {
  return {type: types.DELETE_ADDR, id}
}

export function editAddr(id, address) {
  return {type: types.EDIT_ADDR, id, address}
}

export function receiveAddrs(addressList) {
  return {type: types.RECEIVE_ADDRS, data: addressList}
}

export function notifyUser(message) {
  return {type: types.NOTIFY_USER, message}
}

export function fetchAddrs() {
  return dispatch => {
    return fetch('/lead/address')
      .then(response => response.json())
      .then(json => dispatch(receiveAddrs(json)))
  };
}

export function updateAddrs(next, prev) {
  return dispatch => {
    return fetch('/lead/address', {
      method: 'PUT',
      credentials: 'include',
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(next)
    }).then(res => {
      
      if (res.status !== 200) {
        console.error('fail to sync address changes');
        dispatch(notifyUser('Failed to sync address changes'));
        dispatch(receiveAddrs(prev));
        return;
      }
      
      const message = next.length > prev.length ? 
          'New address added' : next.length < prev.length ? 
          'Address is removed' : 'Address is updated';
      
      dispatch(notifyUser(message));
    })
  };
}