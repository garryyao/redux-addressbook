import 'babel-polyfill'
import 'whatwg-fetch'
import 'material-design-lite/material'
import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import App from './containers/App'
import store from './store'
import './styles/main.scss'

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
