import Web3Modal from "web3modal"
import Authereum from "authereum";
import Fortmatic from "fortmatic";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "e87f83fb85bf4aa09bdf6605ebe144b7"
    }
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: "pk_live_EC842EEAC7F08995"
    }
  },
  authereum: {
    package: Authereum,
    options: {}
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions
});


export default web3Modal
