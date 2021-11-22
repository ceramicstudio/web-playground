import { DID } from 'dids'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getProvider } from './wallet'
import type { ResolverRegistry } from 'did-resolver'

declare global {
  interface Window {
    did?: DID
  }
}

const ceramicPromise = createCeramic()

const authenticate = async (): Promise<string> => {
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  const keyDidResolver = KeyDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolverRegistry: ResolverRegistry = {
    ...threeIdResolver,
    ...keyDidResolver,
  }
  const did = new DID({
    provider: provider,
    resolver: resolverRegistry,
  })
  await did.authenticate()
  await ceramic.setDID(did)
  const idx = createIDX(ceramic)
  window.did = ceramic.did
  return idx.id
}

const updateAlert = (status: string, message: string) => {
  const alert = document.getElementById('alerts')

  if (alert !== null) {
    alert.textContent = message
    alert.classList.add(`alert-${status}`)
    alert.classList.remove('hide')
    setTimeout(() => {
      alert.classList.add('hide')
    }, 5000)
  }
}

document.getElementById('activate_ceramic')?.addEventListener('click', () => {
  const ceramicIframe = document.getElementById('ceramic_docs')
  if (ceramicIframe?.classList.contains('show')) {
    ceramicIframe?.classList.remove('show')
    document.getElementById('activate_ceramic')?.classList.remove('active')
  } else {
    document.getElementById('activate_ceramic')?.classList.add('active')
    ceramicIframe?.classList.add('show')
  }
})

document.getElementById('activate_idx')?.addEventListener('click', () => {
  const idxIframe = document.getElementById('idx_docs')
  if (idxIframe?.classList.contains('show')) {
    idxIframe?.classList.remove('show')
    document.getElementById('activate_idx')?.classList.remove('active')
  } else {
    document.getElementById('activate_idx')?.classList.add('active')
    idxIframe?.classList.add('show')
  }
})

document.getElementById('bauth')?.addEventListener('click', () => {
  document.getElementById('loader')?.classList.remove('hide')
  authenticate().then(
    (id) => {
      const userDid = document.getElementById('userDID')
      const concatId = id.split('did:3:')[1]
      if (userDid !== null) {
        userDid.textContent = `${concatId.slice(0, 4)}...${concatId.slice(
          concatId.length - 4,
          concatId.length
        )}`
      }
      updateAlert('success', `Successfully connected with ${id}`)
      document.getElementById('loader')?.classList.add('hide')
      document.getElementById('bauth')?.classList.add('hide')
      document.getElementById('instructions')?.classList.remove('hide')
    },
    (err) => {
      console.error('Failed to authenticate:', err)
      updateAlert('danger', err)
      document.getElementById('loader')?.classList.add('hide')
    }
  )
})
