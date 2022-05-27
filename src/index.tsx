import React from 'react'
import ReactDOM from 'react-dom'
import * as Redux from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import App from './app'
import { CookieConsent } from '@/components/cookie-consent'
import { store } from '@/store/setup'
import env from './envs'
import reportWebVitals from './reportWebVitals'
import './index.css'
import './remark.scss'
import './atom-one-dark-theme.css'

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY,
  integrations: [new BrowserTracing()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={env.domain}
      clientId={env.clientId}
      audience="https://api.svb-41.com"
      scope="openid profile email offline_access"
      redirectUri={window.location.origin}
      cacheLocation="localstorage"
      useRefreshTokens
    >
      <Redux.Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <CookieConsent />
      </Redux.Provider>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
