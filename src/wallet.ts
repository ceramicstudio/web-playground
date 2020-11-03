import WalletConnectProvider from '@walletconnect/web3-provider'
// @ts-ignore
import { ThreeIdConnect, EthereumAuthProvider } from '3id-connect'
import Authereum from 'authereum'
import Fortmatic from 'fortmatic'
import Web3Modal from 'web3modal'

export const wallet = new ThreeIdConnect()

export const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'e87f83fb85bf4aa09bdf6605ebe144b7',
      },
    },
    fortmatic: {
      package: Fortmatic,
      options: {
        key: 'pk_live_EC842EEAC7F08995',
      },
    },
    authereum: {
      package: Authereum,
      options: {},
    },
  },
})

export async function getAuthProvider(): Promise<EthereumAuthProvider> {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()
  return new EthereumAuthProvider(ethProvider, addresses[0])
}
