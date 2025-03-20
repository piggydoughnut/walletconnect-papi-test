const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { encodeAddress } = require('@polkadot/util-crypto');
console.log('wtf')
async function createTransaction() {
  // Connect to Polkadot node (using WebSocket)
  const wsProvider = new WsProvider('wss://rpc.westend.io'); // Example: Public Westend node
  console.log('ws provider')
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('connecting to api ', api)

  // Create a keyring instance to handle accounts
  const keyring = new Keyring({ type: 'sr25519' });

  // Load the sender's account (replace with your own seed phrase or private key)
  const sender = keyring.addFromUri('//Alice'); // Alice is used for testing purposes

  // Receiver address and transfer amount (replace with actual address and amount)
  const receiverAddress = '5F7aECSMP77dwPYMjyHAbN1FHbxQGMFFCi5pcYQC7CYdouQs'; // Example address
  const amount = 10000000000n; // Amount to send (e.g., 10 DOT)

  // Create the transfer transaction
  const transfer = api.tx.balances.transfer(receiverAddress, amount);

  // Log the unsigned transaction details (before signing)
  console.log('Unsigned Transaction:', transfer.toHuman());

  // Get the nonce for the sender's account to ensure the transaction order is correct
  const { nonce } = await api.query.system.account(sender.address);

  // Sign the transaction using the sender's account
  const signedTx = await transfer.signAsync(sender, { nonce });

  // Log the signed transaction details
  console.log('Signed Transaction (Raw):', signedTx.toHex());

  // You can also see the signed transaction as a serialized form
  const rawTx = signedTx.toU8a();
  console.log('Signed Transaction (Serialized):', rawTx);

  // Send the transaction
  const hash = await signedTx.send((status) => {
    if (status.isInBlock) {
      console.log(`Transaction included in block: ${status.asInBlock}`);
    } else if (status.isFinalized) {
      console.log(`Transaction finalized with hash: ${hash}`);
    }
  });

  console.log('Transaction sent with hash:', hash.toHex());
}

createTransaction().catch(console.error);
