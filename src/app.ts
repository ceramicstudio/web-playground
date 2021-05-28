import { DID } from 'dids'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

import { createCeramic } from './ceramic'
import { createIDX } from './idx'
import { getProvider } from './wallet'
import type { ResolverRegistry } from 'did-resolver'
import { NFTStorage } from 'nft.storage'
// import ENS, { getEnsAddress } from '@ensdomains/ensjs'

declare global {
  interface Window {
    did?: DID
  }
}

interface Author {
  pid?: string
  name?: string
  organization?: string
}

// global variables to be hydrated and published
let cid = '' // document.getElementById("myCid").value
const publicationType = '' // document.getElementById("publicationType").value

// Replace the hardcoded value, does not work with env yet
const nftStorageApiKey =
  process.env.NFT_STORAGE_API_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUyZTA5ZTRBNEFBODVkQjMxMTZENjM3Y0Y4ZjhlODU5ZEVkRGExOTQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyMjI0ODQ0NDk4OSwibmFtZSI6Im9wZW4tcGlkIn0.GtHzC6K9f4yiErBYPoNUcS0EgKV6v8El7NWlwmj05Xc'
const nftStorageClient = new NFTStorage({ token: nftStorageApiKey })

const ceramicPromise = createCeramic()

const authenticate = async (): Promise<string> => {
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  const keyDidResolver = KeyDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolverRegistry: ResolverRegistry = {
    ...threeIdResolver,
    ...keyDidResolver,
  }
  const did = new DID({
    provider: provider,
    resolver: resolverRegistry,
  })
  await did.authenticate()
  await ceramic.setDID(did)
  const idx = createIDX(ceramic)
  window.did = ceramic.did
  return idx.id
}

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().then(
    (id) => {
      console.log('Connected with DID:', id)
    },
    (err) => {
      console.error('Failed to authenticate:', err)
    }
  )
})

document.getElementById('upload')?.addEventListener('click', () => {
  const files: any = (<HTMLInputElement>document.getElementById('myFile'))?.files
  const myFile = files && files[0]
  nftStorageClient.storeBlob(myFile).then(
    (_cid) => {
      console.log('CID:', _cid)
      cid = _cid
    },
    (err) => {
      console.error('Failed to upload:', err)
    }
  )
})

document.getElementById('publish')?.addEventListener('click', () => {
  if (cid === '') {
    cid = (<HTMLInputElement>document.getElementById('myCid'))?.value
  }
  console.log('cid', cid)

  const authors: any = []
  // loop through author inputs and build the authors array
  document.getElementsByName('author')?.forEach((e1: any) => {
    const author: Author = {}
    e1.childNodes.forEach((e2: any) => {
      if (e2.name === 'pid[]' && e2.value !== '') {
        author.pid = e2.value
      }
      if (e2.name === 'name[]' && e2.value !== '') {
        author.name = e2.value
      }
      if (e2.name === 'organization[]' && e2.value !== '') {
        author.organization = e2.value
      }
    })
    authors.push(author)
  })
  console.log('authors', authors)

  const description = (<HTMLTextAreaElement>document.getElementById('myDescription'))?.value
  console.log('description', description)

  const pid = (<HTMLInputElement>document.getElementById('myPid'))?.value
  console.log('pid', pid)

  const type = (<HTMLInputElement>document.getElementById('publicationType'))?.value
  console.log('type', type)
  // TODO build JSON-LD based on the schema of the selected type
})

// function registerOnENS async (ens_domain: string, identifyer: string) {
//         const ethProvider = await web3Modal.connect()
//         const ens = new ENS({ethProvider, ensAddress: getEnsAddress('1')})
//         const ENSName = ens.name(ens_domain)
//         const subdomain_tx = await ENSName.createSubdomain(identifyer)
//
//         return true;
//     }

// store is the buttonId
document.getElementById('store')?.addEventListener('click', () => {
  // Replace { hello: 'world' } with JSON-LD content
  window.TileDocument.create(window.ceramic, { hello: 'world' }).then((res: any) =>
    console.log(res.commitId.toString())
  )
})


/*
// getContent is the buttonId
document.getElementById('getContent')?.addEventListener('click', () => {
  const pid = (<HTMLInputElement>document.getElementById('pid'))?.value
  console.log(pid)

  //window.ceramic?.loadStream(pid).then((_content) => console.log(_content))
  window.ceramic
    ?.loadStream(pid)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((_content) => (document.getElementById('update')!.value = _content.state.content))
})
*/

/*
// THIS DOESN'T WORK YET
document.getElementById('update')?.addEventListener('click', () => {
  ;async () => {
    const pid = (<HTMLInputElement>document.getElementById('pid'))?.value
    const content = (<HTMLTextAreaElement>document.getElementById('oldContent'))?.value

    const doc = await window.ceramic?.loadStream(pid)
    
    const newDoc = await doc.update(content)
  }
})
*/