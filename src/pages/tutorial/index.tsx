import { useState } from 'react'
import { Introduction } from './introduction'

export type Page = 'introduction' | 'start'

export const Tutorial = () => {
  const [page, setPage] = useState<Page>('introduction')
  switch (page) {
    case 'introduction':
      return <Introduction onNext={() => setPage('start')} />
    case 'start':
      return null
  }
}
