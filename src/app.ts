import { DID } from 'dids'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

import { createCeramic } from './ceramic'
import { createDataStore } from './datastore'
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
  document.getElementById('authenticating')?.classList.remove('hide')
  await did.authenticate()
  await ceramic.setDID(did)
  const datastore = createDataStore(ceramic)
  window.did = ceramic.did
  return datastore.id
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

const accordions = document.getElementsByClassName('accordion')

for (const accordion of accordions) {
  accordion.addEventListener('click', (e) => {
    if (accordion.classList.contains('acc-close')) {
      accordion.classList.remove('acc-close')
      accordion.classList.add('acc-open')
    } else {
      accordion.classList.add('acc-close')
      accordion.classList.remove('acc-open')
    }
  })
}

document.getElementsByClassName('accordion')

document.getElementById('bauth')?.addEventListener('click', () => {
  document.getElementById('loader')?.classList.remove('hide')
  authenticate().then(
    (id) => {
      const userDid = document.getElementById('did')
      const status = document.getElementById('status')
      const concatId = id.split('did:3:')[1]
      if (userDid !== null) {
        userDid.textContent = `${concatId.slice(0, 4)}...${concatId.slice(
          concatId.length - 4,
          concatId.length
        )}`
        status?.classList.remove('offline')
        status?.classList.add('online')
        document.getElementById('logo')?.classList.add('small-logo')
      }
      updateAlert('success', `Successfully connected with ${id}`)
      document.getElementById('bauth')?.classList.add('hide')
      document.getElementById('profile-cta')?.addEventListener('click', () => {
        window.open(`https://clay.self.id/${id}`, '_blank')
      })
      document.getElementById('post-auth')?.classList.remove('hide')
      document.getElementById('post-auth')?.classList.add('show')
    },
    (err) => {
      console.error('Failed to authenticate:', err)
      updateAlert('danger', err)
      document.getElementById('loader')?.classList.add('hide')
    }
  )
})
