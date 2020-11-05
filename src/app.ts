import type { DID } from 'dids'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getAuthProvider } from './wallet'

declare global {
  interface Window {
    did?: DID
  }
}

const ceramicPromise = createCeramic()

const authenticate = async (): Promise<string> => {
  const [authProvider, ceramic] = await Promise.all([getAuthProvider(), ceramicPromise])
  const idx = await createIDX(ceramic, { authProvider })
  // @ts-ignore DID type mismatch
  window.did = idx.did
  return idx.id
}

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().then(
    (id) => {
      console.log('Connected with DID:', id)
    },
    (err) => {
      console.error('Failed to authenticate:', err)
    }
  )
})
