import { addCollection } from '@iconify/vue/offline'
import localIcons from './local-icons.json'

type LocalIconCollection = Parameters<typeof addCollection>[0]

/** Setup the iconify offline */
export function setupIconifyOffline() {
  localIcons.forEach((collection) => {
    if (!isLocalIconCollection(collection))
      throw new TypeError('Invalid generated local icon collection')

    addCollection(collection)
  })
}

/** Validate the minimal generated Iconify collection shape. */
function isLocalIconCollection(value: unknown): value is LocalIconCollection {
  if (!value || typeof value !== 'object')
    return false

  const collection = value as Record<string, unknown>
  return typeof collection.prefix === 'string'
    && Boolean(collection.icons)
    && typeof collection.icons === 'object'
}
