"use client";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { generateSigner } from "./wc";
import { prepareTransfer } from "./transfer";
import { config } from "./config";
import { useState } from "react";
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

  const [account, setAccount] = useState<string>()
  const [txResult, setTxResult] = useState()

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
      });

      if (uri) {
        walletConnectModal.openModal({
          uri,
        });
      }
      const walletConnectSession = await approval();
      console.log('session ', walletConnectSession)
      const walletConnectAccount = Object.values(
        walletConnectSession.namespaces
      )
        .map((namespace) => namespace.accounts)
        .flat();

      const accounts = walletConnectAccount.map((wcAccount) => {
        const split = wcAccount.split(":");
        console.log(split);
        return { name: split[1], address: split[2] };
      });

      setAccount(accounts[0].address)
      console.log('chosen account ', accounts[0].address)
      walletConnectModal.closeModal()

      const signer = generateSigner(accounts[0].address, walletConnectSession, client)

      const result = await prepareTransfer(
        BigInt(100000000000),
        signer
      );
      setTxResult(result)

    } catch (e) {
      console.log("whoopsie dasie");
      console.log(e);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between gap-4 mt-10">
      <div className="flex flex-col gap-4 ">

        {account && <p>Account: {account}</p>}
        {!txResult && account && <p>Preparing and sending transaction. Check your device to confirm. Check console for logs.</p>}
        {!txResult && account && (
          <div className="w-8 h-8 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        )}
        {txResult && account && (
          <div>
            <p> tx result: {txResult?.ok ? 'success' : 'error'}</p>
            <p> tx hash: {txResult?.txHash}</p>
          </div>
        )}

        <button
          className="h-10 w-fit px-4 bg-slate-400"
          onClick={() => connectWallet()}
        >
          Wallet Connect
        </button>
      </div>
    </main>
  );
}
