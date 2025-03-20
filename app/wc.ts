import {
  getPolkadotSignerFromPjs,
  SignerPayloadJSON,
} from "polkadot-api/pjs-signer";

import { config } from "./config";

let requestId = 1;

export function generateSigner(account: string, session, client) {
  return getPolkadotSignerFromPjs(
    account,
    async (payload: SignerPayloadJSON): Promise<any> => {
      // Log the full payload to inspect its contents
      // console.log("signPayload: Signing Payload:", payload);

      // Log address separately
      // console.log("signPayload: Address from Payload:", payload.address);

      console.log("TRANSACTION PAYLOAD ", payload);
      const request = {
        topic: session.topic,
        chainId: config.wndChainId,
        request: {
          id: 1,
          jsonrpc: "2.0",
          method: "polkadot_signTransaction",
          params: {
            address: payload.address,
            transactionPayload: {
              ...payload,
              nonce: "0007876876",
              signedExtensions: [
                "CheckNonZeroSender",
                "CheckSpecVersion",
                "CheckTxVersion",
                "CheckGenesis",
                "CheckMortality",
                "CheckNonce",
                "CheckWeight",
                "ChargeTransactionPayment",
                "CheckMetadataHash",
                "WeightReclaim",
              ],
            },
          },
        },
      };

      try {
        console.log("signPayload: About to sign request ", request);
        const response = await client.request<Signature>(request);
        console.log("signPayload: Signed the request ", response);
        return { id: ++requestId, signature: response?.signature };
      } catch (error) {
        console.error(
          "signPayload: Error during WalletConnect signing:",
          error
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

      const { signature } = await client.request<Signature>(request);

      return { id: ++requestId, signature };
    }
  );
}
