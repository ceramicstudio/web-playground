# [Ceramic Web Playground](https://ceramicstudio.github.io/web-playground/)

Test the full stack of [Ceramic Network](https://ceramic.network/) components in a web browser.

## Technologies

- [Ceramic HTTP Client](https://developers.ceramic.network/reference/javascript/clients/#http-client): Provides access to the Ceramic Network via a remote node running Ceramic (and IPFS).
- [3ID Connect](https://developers.ceramic.network/build/authentication/#did-provider-or-wallet): Provides authentication to a DID (used by Ceramic) from a blockchain wallet, and stores a link from this blockchain account to your DID in IDX.
- [IDX](https://idx.xyz/): Provides a way to create identity records for a DID. Records are stored on Ceramic and can represent links to blockchain accounts or other user data.

## Usage

1. Open the [Playground page](https://ceramicstudio.github.io/web-playground/)
1. Open your console by inspecting the page
1. Authenticate by clicking "Connect wallet"
1. Approve prompts in your Web3 wallet
1. Wait to see "Connected with DID" in your console
1. Write and read documents on the Ceramic Network from the console using the referenced API methods
1. Write and read records on IDX from the console using the referenced API methods

## License

Apache-2.0 OR MIT
