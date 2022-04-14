import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { Login } from './login'
import { Details } from './details'

export const Account = () => {
  const user = useSelector(selectors.userData)
  if (!user.user) return <Login />
  return <Details />
}
