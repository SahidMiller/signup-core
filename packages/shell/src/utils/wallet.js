const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import localforage from "localforage";
import { WALLET_HD_PATH } from "../config";

//This is persisted, God willing, only once for a "session" and removed on logout, God willing.
//Used for verifying the user signed a CID and used to display, God willing.
export async function getWalletVerificationAddress() {
  return await localforage.getItem("SIGNUP_ACCOUNT_ADDRESS");
}

export async function getWalletKeypair() {
  let userRecieveAccount;

  const userWallet = await localforage.getItem("SIGNUP_ACCOUNT");
  if (userWallet) {
    userRecieveAccount = bitbox.ECPair.fromWIF(userWallet);
  }

  const walletStatus = await localforage.getItem("SIGNUP_ACCOUNT_STATUS");
  return walletStatus && userRecieveAccount;
}

export async function doesWalletExist() {
  return Boolean(await getWalletKeypair());
}

export async function getWalletAddr() {
  const keypair = await getWalletKeypair();

  if (keypair) {
    const legacyAddr = keypair.getAddress();
    return bitbox.Address.toCashAddress(legacyAddr);
  }
}

export async function deleteWallet() {
  //TODO God willing: add ipfs wallet info and group together, God willing.
  await localforage.removeItem("SIGNUP_ACCOUNT");
  await localforage.removeItem("SIGNUP_ACCOUNT_ADDRESS");
  await localforage.removeItem("SIGNUP_ACCOUNT_STATUS");
  await localforage.removeItem("SIGNUP_PREDICTED_CASH_ACCOUNT");
}

export async function storeWalletInfo(hdNode) {
  const verificationAddress = bitbox.HDNode.toCashAddress(hdNode);
  const accountRecieveKey = bitbox.HDNode.derivePath(hdNode, WALLET_HD_PATH);

  await localforage.setItem("SIGNUP_ACCOUNT_ADDRESS", verificationAddress);
  await localforage.setItem(
    "SIGNUP_ACCOUNT",
    accountRecieveKey.keyPair.toWIF()
  );
  await localforage.setItem("SIGNUP_ACCOUNT_STATUS", "VERIFIED");
}

// Get an object and sign a standard Signup Signature Payload
export async function signPayload(data, requestedBy) {
  if (typeof data !== "object") {
    throw new Error("data should be a valid object");
  }

  if (!requestedBy) {
    throw new Error("requestedBy is not specified");
  }

  const payload = {
    signedBy: "Signup.cash",
    requestedBy,
    data,
    timestamp: Date.now(),
  };

  const keypair = await getWalletKeypair();

  if (keypair) {
    const wif = keypair.toWIF();
    const signature = bitbox.BitcoinCash.signMessageWithPrivKey(
      wif,
      JSON.stringify(payload)
    );

    const legacyAddr = walletHdNode.keyPair.getAddress();
    const bchAddr = bitbox.Address.toCashAddress(legacyAddr);

    return {
      signature,
      payload,
      bchAddr,
    };
  }
}
