const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import localforage from "localforage";
import { SIGNUP_REQUESTED_IPFS_PATH } from "../config";

export async function getRequestedIpfsPath() {
  return;
}

export async function storeRequestedIpfsPath(path) {
  await localforage.setItem(SIGNUP_REQUESTED_IPFS_PATH, path);
}

export async function getSession() {
  //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does or vice versa.
  const { account, sig } =
    (await localforage.getItem("SIGNUP_LOGGEDIN_ACCOUNT")) || {};
  return account && sig && verifyAccount(account, sig) && account;
}

export async function storeSession(wif, account) {
  const sig = await signAccount(wif, account);
  await localforage.setItem("SIGNUP_LOGGEDIN_ACCOUNT", { account, sig });
}

export async function deleteSession() {
  //TODO God willing: add ipfs wallet info and group together, God willing.
  await localforage.removeItem("SIGNUP_LOGGEDIN_ACCOUNT");
  await localforage.removeItem("SIGNUP_PREDICTED_CASH_ACCOUNT");
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

export async function signAccount(wif, account) {
  //TODO God willing: add version to message so it can be decoded in future, God willing.
  return bitbox.BitcoinCash.signMessageWithPrivKey(
    wif,
    JSON.stringify(account)
  );
}

export async function verifyAccount(account, sig) {
  try {
    //TODO God willing: store version so we can decode properly on upgrade, God willing.
    const verified = bitbox.BitcoinCash.verifyMessage(
      account.verificationAddress,
      sig,
      JSON.stringify(account)
    );

    return !!verified;
  } catch (e) {
    return false;
  }
}
