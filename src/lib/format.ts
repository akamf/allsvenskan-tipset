import { formatDistanceToNowStrict } from 'date-fns'

export function formatSyncTime(value: string | null | undefined) {
  if (!value) {
    return 'No sync yet'
  }

  return formatDistanceToNowStrict(new Date(value), { addSuffix: true })
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
