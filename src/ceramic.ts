import type { CeramicApi } from '@ceramicnetwork/common'
import Ceramic from '@ceramicnetwork/http-client'
// import dagJose from 'dag-jose'
// import IPFS from 'ipfs'
// @ts-ignore
// import multiformats from 'multiformats/basics'
// @ts-ignore
// import legacy from 'multiformats/legacy'

// @ts-ignore
// multiformats.multicodec.add(dagJose)
// @ts-ignore
// const dagJoseFormat = legacy(multiformats, dagJose.name)

declare global {
  interface Window {
    ceramic?: CeramicApi
    // ipfs?: typeof IPFS
  }
}

export async function createCeramic(): Promise<CeramicApi> {
  // @ts-ignore
  // window.ipfs = await IPFS.create({ ipld: { formats: [dagJoseFormat] } })
  // window.ceramic = await Ceramic.create(window.ipfs)
  const ceramic = new Ceramic('https://ceramic-dev.3boxlabs.com')
  window.ceramic = ceramic
  // @ts-ignore Ceramic type
  return Promise.resolve(ceramic as CeramicApi)
}
