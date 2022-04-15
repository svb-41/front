import decode from 'jwt-decode'
import { useState, useCallback, useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import * as Sentry from '@sentry/react'
import envs from '@/envs'

export type Provider = 'username' | 'google'
export type Connection = 'google-oauth2' | 'Username-Password-Authentication'

export const useAuth = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const auth0 = useAuth0()

  const update = useCallback(async () => {
    try {
      const accessToken = await auth0.getAccessTokenSilently()
      if (accessToken) {
        const idToken = await auth0.getIdTokenClaims()
        const username = idToken?.['https://app.svb41.com/username'] ?? ''
        const action = actions.login(idToken, accessToken, username)
        await dispatch(action)
      }
    } catch (error) {
      Sentry.captureException(error)
    }
    return null
  }, [dispatch, auth0])

  const login = useCallback(
    async (connection: Connection) => {
      try {
        setLoading(true)
        await auth0.loginWithPopup({ connection })
        const idToken = await auth0.getIdTokenClaims()
        const accessToken = await auth0.getAccessTokenSilently()
        const username = idToken?.['https://app.svb41.com/username'] ?? ''
        const action = actions.login(idToken, accessToken, username, true)
        await dispatch(action)
      } catch {
      } finally {
        setLoading(false)
      }
    },
    [dispatch, auth0]
  )

  return useMemo(() => ({ update, login, loading }), [update, login, loading])
}