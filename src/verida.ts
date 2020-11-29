import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import type { JWE } from 'did-jwt'
import type { DID } from 'dids'
// @ts-ignore
import Verida from '@verida/datastore'
import WalletUtils from '@verida/wallet-utils'
// @ts-ignore
import { fromString, toString } from 'uint8arrays'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getAuthProvider } from './wallet'

declare global {
  interface Window {
    did?: DID
  }
}

const ceramicPromise = createCeramic()

const VeridaSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Ethereum wallet',
  type: 'object',
}

const authenticate = async (): Promise<void> => {
  console.log('Authenticating...')

  const [authProvider, ceramic] = await Promise.all([getAuthProvider(), ceramicPromise])
  const idx = await createIDX(ceramic, { authProvider })

  window.did = idx.did
  console.log('Authenticated with DID:', idx.id)

  console.log('Creating IDX setup...')
  // @ts-ignore
  const schemaID = await publishSchema(ceramic, { content: VeridaSchema })
  const definitionID = await createDefinition(ceramic, {
    name: 'Ethereum key',
    description: 'Ethereum key for connecting to Verida applications',
    schema: schemaID.toUrl('base36'),
  })
  const seedKey = definitionID.toString()
  console.log('IDX setup created with definition ID:', seedKey)

  const createWallet = async (): Promise<object> => {
    const wallet = WalletUtils.createWallet('ethr')
    const jwe = await idx.did.createJWE(fromString(JSON.stringify(wallet)), [idx.id])
    await idx.set(seedKey, jwe)
    return wallet
  }
  // @ts-ignore
  window.createWallet = createWallet

  const getVerida = async (appName: string): Promise<any | null> => {
    const jwe = await idx.get<JWE>(seedKey)
    if (jwe == null) {
      return null
    }
    const decrypted = await idx.did.decryptJWE(jwe)
    const wallet = JSON.parse(toString(decrypted))
    const app = new Verida({
      appName: appName,
      chain: wallet.chain,
      address: wallet.address,
      privateKey: wallet.privateKey
    })
    return app
  }
  // @ts-ignore
  window.getVerida = getVerida

  console.log('Next steps:')
  console.log(
    'Run `wallet = await createWallet()` to create a new Ethereum wallet and save it with IDX'
  )
  console.log(
    'You can then run `verida = await getVerida("My application name")` to retrieve the saved Ethereum wallet and create a new Verida application instance for the given application name'
  )
  console.log(
    'Run `await verida.connect()` to initialize the Verida application instance'
  )
  console.log(
    'Run `testDb = await verida.openDatabase("myEncryptedDatabase")` to open an encrypted database'
  )
  console.log(
    'Run `await testDb.save({hello: "Verida with IDX"})` to save data in your encrypted test database'
  )
  console.log(
    'You can then run `await testDb.getMany()` to load the saved data'
  )
  console.log(
    '---'
  )
  console.log(
    'Learn more about creating permissioned databases, datastores, schemas, messaging etc. in the Verida documentation: https://docs.datastore.verida.io/'
  )
}

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().catch((err) => {
    console.error('Failed to authenticate:', err)
  })
})
