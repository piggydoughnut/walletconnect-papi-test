import { ChainDefinition, createClient, TypedApi } from "polkadot-api";
import { MultiAddress, wnd } from "@polkadot-api/descriptors";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { config } from "./config";

const chains: Record<any, ChainDefinition> = {
  WESTEND: wnd,
};

const westend = [
  "wss://westend-rpc.dwellir.com",
  "wss://westend-rpc-tn.dwellir.com",
  "wss://rpc.ibp.network/westend",
  "wss://westend.dotters.network",
  "wss://westend.api.onfinality.io/public-ws",
  "wss://westend-rpc.polkadot.io",
  "wss://westend.public.curie.radiumblock.co/ws",
];

export const prepareTransfer = async (value: bigint, signer: any) => {
  // create the client with smoldot
  const client = createClient(withPolkadotSdkCompat(getWsProvider(westend)));
  // get the safely typed API
  const api: TypedApi<typeof wnd> = client.getTypedApi(chains.WESTEND);

  const transfer = api.tx.Balances.transfer_keep_alive({
    dest: MultiAddress.Id(config.addressTo),
    value,
  });

  console.log("Making a transfer to ", config.addressTo, " value: ", value);

  // sign and submit the transaction while looking at the
  // different events that will be emitted
  //   return transfer.signSubmitAndWatch(signer).subscribe({
  //     next: (event) => console.log("Tx event: ", event.type),
  //     error: (e) => console.error("Tx event: error ", e),
  //     complete() {
  //       client.destroy();
  //     },
  //   });
  const nonce = await api.apis.AccountNonceApi.account_nonce(config.addressTo);

  console.log("NEW NONCE ", nonce.toString());

  return transfer.signAndSubmit(signer, { nonce });
};
