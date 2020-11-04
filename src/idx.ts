import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import type Ceramic from '@ceramicnetwork/ceramic-core'
import KeyDidResolver from '@ceramicnetwork/key-did-resolver'
import { IDXWeb } from '@ceramicstudio/idx-web'
// @ts-ignore
import type { EthereumAuthProvider } from '3id-connect'

declare global {
  interface Window {
    idx?: IDXWeb
  }
}

export async function createIDX(
  ceramic: Ceramic,
  authProvider: EthereumAuthProvider
): Promise<IDXWeb> {
  const registry = {
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic),
  }
  // @ts-ignore
  const idx = new IDXWeb({ ceramic, resolver: { registry } })
  await idx.authenticate({ authProvider })
  window.idx = idx
  return idx
}
