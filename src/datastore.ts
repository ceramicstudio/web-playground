import { CeramicApi } from '@ceramicnetwork/common'
import { DIDDataStore } from '@glazed/did-datastore'

declare global {
  interface Window {
    DataStore: DIDDataStore
  }
}

const publishedModel = {
  schemas: {
    basicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
  },
  definitions: {
    basicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
  },
  tiles: {},
}

export function createDataStore(ceramic: CeramicApi): DIDDataStore {
  const datastore = new DIDDataStore({ ceramic, model: publishedModel })
  window.DataStore = datastore
  return datastore
}
