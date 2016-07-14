import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from '../reducers'

const store = createStore(rootReducer, {}, applyMiddleware(
  thunkMiddleware
));

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextReducer = require('../reducers').default
    store.replaceReducer(nextReducer)
  })
}

export default store;
