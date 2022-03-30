import React from 'react'
import ReactDOM from 'react-dom'
import * as Redux from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './app'
import { store } from '@/store'
import reportWebVitals from './reportWebVitals'
import './index.css'
import './remark.scss'
import './atom-one-dark-theme.css'

ReactDOM.render(
  <React.StrictMode>
    <Redux.Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Redux.Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
