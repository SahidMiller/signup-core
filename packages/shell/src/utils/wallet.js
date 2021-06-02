const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import localforage from "localforage";
import passworder from "browser-passworder";
import { WALLET_HD_PATH } from "../config";

export function createRecoveryPhrase() {
  const mnemonic = bitbox.Mnemonic.generate(128);
  return { mnemonic };
}

export function isRecoveryKeyValid(mnemonic) {
  return (
    bitbox.Mnemonic.validate(mnemonic, bitbox.Mnemonic.wordLists().english) ===
    "Valid mnemonic"
  );
}

export async function findWallet(email, password) {
  const key = await passworder.keyFromPassword(password, btoa(email));
  const encryptedWifs = (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];
  return await Promise.any(
    encryptedWifs.map((encryptedWif) =>
      passworder.decryptWithKey(key, encryptedWif)
    )
  );
}

export async function storeEncryptedWif(encryptionKey, verficationKey, wif) {
  const encryptedWif = await passworder.encryptWithKey(encryptionKey, wif);
  const encryptedWifs = (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];

  await localforage.setItem("SIGNUP_ACCOUNT_ADDRESS", verficationKey);
  await localforage.setItem("SIGNUP_ACCOUNTS", [
    ...encryptedWifs,
    encryptedWif,
  ]);
}

export async function storeWallet(accountRecieveKey) {
  await localforage.setItem(
    "SIGNUP_ACCOUNT",
    accountRecieveKey.keyPair.toWIF()
  );
}

export async function storeWalletIsVerified() {
  await localforage.setItem("SIGNUP_ACCOUNT_STATUS", "VERIFIED");
}

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

export async function checkHasWallets() {
  return !!((await localforage.getItem("SIGNUP_ACCOUNTS")) || []).length;
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

export async function storeWalletInfo(hdNode, wif, encryptionKey) {
  const verificationAddress = bitbox.HDNode.toCashAddress(hdNode);
  const accountRecieveKey = bitbox.HDNode.derivePath(hdNode, WALLET_HD_PATH);
  await storeEncryptedWif(encryptionKey, verificationAddress, wif);
  await storeWallet(accountRecieveKey);
  await storeWalletIsVerified();
}
