import { File } from '@/components/monaco'

export type AI = {
  id: string
  file: File
  updatedAt: Date | string
  createdAt: Date | string
  compiledValue?: string
  tags: Array<string>
  description?: string
}
