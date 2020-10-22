import web3Modal from './providers.js'
const { ThreeIdConnect, EthereumAuthProvider } = require('./../src/index')
import { DID } from 'dids'
import IPFS from 'ipfs'
import Ceramic from '@ceramicnetwork/ceramic-core'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from '@ceramicnetwork/key-did-resolver'

import dagJose from 'dag-jose'
import multiformats from 'multiformats/basics'
import legacy from 'multiformats/legacy'

multiformats.multicodec.add(dagJose)
const dagJoseFormat = legacy(multiformats, dagJose.name)

const threeIdConnect = new ThreeIdConnect()

const start = async () => {
  // create ipfs and ceramic
  window.ipfs = await IPFS.create({ ipld: { formats: [dagJoseFormat] } })
  window.ceramic = await Ceramic.create(window.ipfs)
}
const startPromise = start()

const authenticate = async () => {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()

  // create 3id connect instance
  const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
  await threeIdConnect.connect(authProvider)

  // create did instance
  const didProvider = await threeIdConnect.getDidProvider()
  await startPromise
  const resolver = {
    registry: {
      ...KeyDidResolver.getResolver(), ...ThreeIdResolver.getResolver(window.ceramic)
    }
  }
  const did = new DID({ provider: didProvider, resolver })
  await did.authenticate()
  window.did = did
  console.log('Connected with DID:', did.id)

}

bauth.addEventListener('click', authenticate)
