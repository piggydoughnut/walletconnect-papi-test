import { getPolkadotSignerFromPjs } from "polkadot-api/pjs-signer";

import { config } from "./config";
import { ISignClient, SessionTypes } from "@walletconnect/types";

export function generateSigner(
  account: string,
  session: SessionTypes.Struct,
  client: ISignClient,
) {
  return getPolkadotSignerFromPjs(
    account,
    async (payload) => {
      console.log("signPayload: Signing Payload:", payload);
      const request = {
        topic: session.topic,
        chainId: config.wndChainId,
        request: {
          method: "polkadot_signTransaction",
          params: {
            address: payload.address,
            transactionPayload: payload,
          },
        },
      };

      try {
        console.log("signPayload: About to sign request ", request);
        const response = await client.request(request);
        console.log("signPayload: Signed the request ", response);
        return response as any;
      } catch (error) {
        console.error(
          "signPayload: Error during WalletConnect signing:",
          error,
        );
        console.log(error);
        throw error;
      }
    },
    async (raw: any) => {
      const request = {
        topic: session.topic,
        chainId: config.wndChainId,
        request: {
          method: "polkadot_signMessage",
          params: { address: raw.address, message: raw.data },
        },
      };

      return client.request(request);
    },
  );
}
