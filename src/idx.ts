import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import type { CeramicApi } from '@ceramicnetwork/ceramic-common'
import KeyDidResolver from '@ceramicnetwork/key-did-resolver'
import { IDXWeb } from '@ceramicstudio/idx-web'
import type { WebAuthenticateOptions } from '@ceramicstudio/idx-web'

declare global {
  interface Window {
    idx?: IDXWeb
  }
}

export async function createIDX(
  ceramic: CeramicApi,
  options: WebAuthenticateOptions
): Promise<IDXWeb> {
  const registry = {
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic),
  }
  // @ts-ignore
  const idx = new IDXWeb({ ceramic, resolver: { registry } })
  await idx.authenticate(options)
  idx.did.setResolver(idx.resolver)
  window.idx = idx
  return idx
}
