import { Effect } from '@/store/types'

export const UPDATE_AFTER_FETCH = 'cross/UPDATE_AFTER_FETCH'

export const updateAtferFetch: Effect<void> = dispatch => {
  dispatch({ type: UPDATE_AFTER_FETCH })
}
