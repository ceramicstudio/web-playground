import web3Modal from './providers.js'
const { ThreeIdConnect, EthereumAuthProvider } = require('./../src/index')
const THREEID_CONNECT_URL = 'https://3idconnect.org/index.html'
import { DID } from 'dids'
import IPFS from 'ipfs'
import Ceramic from '@ceramicnetwork/ceramic-core'

import dagJose from 'dag-jose'
import multiformats from 'multiformats/basics'
import legacy from 'multiformats/legacy'

multiformats.multicodec.add(dagJose)
const dagJoseFormat = legacy(multiformats, dagJose.name)

const threeIdConnect = new ThreeIdConnect(THREEID_CONNECT_URL)
const ipfsPromise = IPFS.create({ ipld: { formats: [dagJoseFormat] } })

const authenticate = async () => {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()

  // create 3id connect instance
  const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
  await threeIdConnect.connect(authProvider)

  // create did instance
  const didProvider = await threeIdConnect.getDidProvider()
  const did = new DID({ provider: didProvider })
  await did.authenticate()
  window.did = did
  console.log('Connected with DID:', did.id)

  // create ipfs and ceramic
  window.ipfs = await ipfsPromise
  window.ceramic = await Ceramic.create(window.ipfs)
}

bauth.addEventListener('click', authenticate)
