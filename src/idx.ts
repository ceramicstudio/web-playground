import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'

import { schemas } from '@ceramicstudio/idx-constants'

declare global {
  interface Window {
    idx?: IDX
  }
}

window.definitionUrl = schemas.Definition

window.exampleDID = 'did:key:z6MkuEd4fm7qNq8hkmWFM1NLVBAXa4t2GcNDdmVzBrRm2DNm'
window.exampleDID2 = 'did:3:kjzl6cwe1jw146g16yd2w2dhcirw4zhevar48divve67jx3fq5ztxsx12aimr5y'

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic })
  window.idx = idx
  return idx
}
