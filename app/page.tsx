"use client";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { generateSigner } from "./wc";
import { prepareTransfer } from "./transfer";
import { config } from "./config";
const chains = [
  // "polkadot:91b171bb158e2d3848fa23a9f1c25182", // Polkadot
  // "polkadot:b0a8d493285c2df73290dfb7e61f870f", // Kusama
  config.wndChainId, // Westend
]
const params = {
  requiredNamespaces: {
    polkadot: {
      methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
      chains: chains,
      events: ['chainChanged', 'accountsChanged']
    },
  },
};

export default function Home() {
  async function connectWallet() {
    try {
      const universalProvider = await UniversalProvider.init({
        projectId: config.walletConnectProjectId,
        relayUrl: "wss://relay.walletconnect.com",
      });
      const client = universalProvider?.client

      if (!universalProvider || !client) {
        console.error("WalletConnect client is not initialized!");
        return;
      }

      console.log("Existing event listeners:", client.events);
      console.log("Existing event listeners:", universalProvider.events);

      client.on("session_update", (event) => {
        console.log("Session updated:", event);
      });

      client.on("session_delete", (event) => {
        console.log("Session deleted:", event);
      });

      client.on("session_proposal", (event) => {
        console.log("New session proposal:", event);
      });

      client.on("session_request", (event) => {
        console.log("Session request received:", event);
      });

      universalProvider.on("session_request", (event) => {
        console.log("Provider session request:", event);
      });

      universalProvider.on("session_update", (event) => {
        console.log("Provider session updated:", event);
      });

      universalProvider.on("session_delete", (event) => {
        console.log("Provider session deleted:", event);
      });


      const { uri, approval } = await universalProvider?.client.connect(params);

      const walletConnectModal = new WalletConnectModal({
        chains: chains,
        projectId: config.walletConnectProjectId,
        explorerRecommendedWalletIds: [
          //  nova wallet
          "43fd1a0aeb90df53ade012cca36692a46d265f0b99b7561e645af42d752edb92",
          // subwallet
          "9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a",
        ],
        themeVariables: {
          "--wcm-font-family": "Unbounded, sans-serif",
          "--wcm-accent-color": "#E6007A",
          // ...
        },
      });
      console.log("URI: ", uri);

      if (uri) {
        walletConnectModal.openModal({
          uri,
        });
        // window.location.href = "subwallet://wc?uri=" + uri;
      }
      const walletConnectSession = await approval();
      console.log('session ', walletConnectSession)
      const walletConnectAccount = Object.values(
        walletConnectSession.namespaces
      )
        .map((namespace) => namespace.accounts)
        .flat();
      console.log('walletConnectAccount ', walletConnectAccount);

      // grab account addresses from CAIP account formatted accounts
      const accounts = walletConnectAccount.map((wcAccount) => {
        const split = wcAccount.split(":");
        console.log(split);
        return { name: split[1], address: split[2] };
      });


      console.log('accounts ', accounts)

      const signer = generateSigner(accounts[0].address, walletConnectSession, client)

      prepareTransfer(
        BigInt(100000000000),
        signer
      );

    } catch (e) {
      console.log("whoopsie dasie");
      console.log(e);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button
        className="h-10 w-fit px-4 bg-slate-400"
        onClick={() => connectWallet()}
      >
        Wallet Connect
      </button>
    </main>
  );
}
