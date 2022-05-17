import { useEffect } from 'react'
import { getInventory } from '@/services/inventory'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { Login } from '../login'
import { Details } from './details'

export const Account = () => {
  const user = useSelector(selectors.userData)
  useEffect(() => {
    if (user.user?.accessToken)
      getInventory({ token: user.user.accessToken }).then(console.log)
  })
  if (!user.user) return <Login />
  return <Details />
}
