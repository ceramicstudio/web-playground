import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import { createTile, createDefinition } from '@ceramicstudio/idx-tools'

declare global {
  interface Window {
    idx?: IDX
  }
}

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic })
  window.createTile = createTile
  window.createDefinition = createDefinition
  window.elizabethDID = 'did:3:kjzl6cwe1jw146g16yd2w2dhcirw4zhevar48divve67jx3fq5ztxsx12aimr5y'
  window.paulDID = 'did:key:z6MkuEd4fm7qNq8hkmWFM1NLVBAXa4t2GcNDdmVzBrRm2DNm'
  window.idx = idx
  return idx
}
