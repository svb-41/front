const params: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

export const toLocale = (date: Date) => {
  return date.toLocaleString(undefined, params)
}
