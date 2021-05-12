import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import type { JWE } from 'did-jwt'
import type { DID } from 'dids'
import { SkynetClient, genKeyPairFromSeed } from 'skynet-js'
import { fromString, toString } from 'uint8arrays'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getProvider } from './wallet'

window.skynet = new SkynetClient('https://siasky.net')

declare global {
  interface Window {
    did?: DID
    skynet: SkynetClient
  }
}

const ceramicPromise = createCeramic()

const SkyDBSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'SkyDB',
  type: 'object',
}

const authenticate = async (): Promise<void> => {
  console.log('Authenticating...')

  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  await ceramic.setDIDProvider(provider)
  const idx = createIDX(ceramic)

  window.did = ceramic.did
  console.log('Authenticated with DID:', idx.id)

  console.log('Creating IDX setup...')
  // @ts-ignore
  const schema = await publishSchema(ceramic, { content: SkyDBSchema })
  const definition = await createDefinition(ceramic, {
    name: 'SkyDB',
    description: 'SkyDB seed',
    schema: schema.commitId.toUrl(),
  })
  const seedKey = definition.id.toString()
  console.log('IDX setup created with definition ID:', seedKey)

  const createKeyPair = async (seed: string): Promise<ReturnType<typeof genKeyPairFromSeed>> => {
    const jwe = await ceramic.did!.createJWE(fromString(seed), [idx.id])
    await idx.set(seedKey, jwe)
    return genKeyPairFromSeed(seed)
  }
  // @ts-ignore
  window.createKeyPair = createKeyPair

  const loadKeyPair = async (): Promise<ReturnType<typeof genKeyPairFromSeed> | null> => {
    const jwe = await idx.get<JWE>(seedKey)
    if (jwe == null) {
      return null
    }
    const decrypted = await ceramic.did!.decryptJWE(jwe)
    return genKeyPairFromSeed(toString(decrypted))
  }
  // @ts-ignore
  window.loadKeyPair = loadKeyPair

  console.log('Next steps:')
  console.log(
    'Run `kp = await createKeyPair("my seed phrase")` to save your seed with IDX and create the SkyDB key pair'
  )
  console.log(
    'You can then run `kp = await loadKeyPair()` to retrieve the saved seed and create the SkyDB key pair'
  )
  console.log(
    'Run `await skynet.db.setJSON(kp.privateKey, "hello", {hello: "SkyDB with IDX"})` to save data in SkyDB'
  )
  console.log(
    'You can then run `await skynet.db.getJSON(kp.publicKey, "hello")` to load the saved data'
  )
}

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().catch((err) => {
    console.error('Failed to authenticate:', err)
  })
})
