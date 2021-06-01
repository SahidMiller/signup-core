const slpjs = require("slpjs");
const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import * as Sentry from "@sentry/browser";
import localforage from "localforage";
import passworder from "browser-passworder"
import { SIGNUP_USED_IPFS_PATHS, SIGNUP_LAST_USED_IPFS_PATH, SIGNUP_REQUESTED_IPFS_PATH } from "../config"

function q(selector, el) {
  if (!el) {
    el = document;
  }
  return el.querySelector(selector);
}

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

/**
 * 
 * @param {string} email email used as salt for pbkdf2 -> aes encryption
 * @param {string} password password for pbkdf2 -> aes encryption
 * @returns {Promise<boolean>} unencrypted xpriv, most likely master used to derive recieve key
 */
export async function findWallet(email, password) {

  const key = await passworder.keyFromPassword(password, btoa(email))
  const encryptedWifs = await localforage.getItem("SIGNUP_ACCOUNTS") || []
  return await Promise.any(encryptedWifs.map((encryptedWif) => passworder.decryptWithKey(key, encryptedWif))) 
}

export async function storeEncryptedWif(encryptionKey, verficationKey, wif) {
  const encryptedWif = await passworder.encryptWithKey(encryptionKey, wif)
  const encryptedWifs = await localforage.getItem("SIGNUP_ACCOUNTS") || []

  await localforage.setItem("SIGNUP_ACCOUNT_ADDRESS", verficationKey)
  await localforage.setItem("SIGNUP_ACCOUNTS", [...encryptedWifs, encryptedWif]);
}

export async function storeWallet(accountRecieveKey) {
  await localforage.setItem("SIGNUP_ACCOUNT", accountRecieveKey.keyPair.toWIF());
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
    userRecieveAccount = bitbox.ECPair.fromWIF(userWallet)
  }

  const walletStatus = await localforage.getItem("SIGNUP_ACCOUNT_STATUS");
  return walletStatus && userRecieveAccount
}

export async function doesWalletExist() {
  return Boolean(await getWalletKeypair());
}

export async function checkHasWallets() {
  return !!(await localforage.getItem("SIGNUP_ACCOUNTS") || []).length
}

export async function getWalletAddr() {
  const keypair = await getWalletKeypair()

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

export async function getLastUsedWalletIpfsPath(verificationAddress) {
  
  try {
    //TODO God willing: store version so we can decode properly on upgrade, God willing.
    const { path, sig, index } = await localforage.getItem(SIGNUP_LAST_USED_IPFS_PATH)
    const messageToSign = JSON.stringify({ path, index })
    
    if (bitbox.BitcoinCash.verifyMessage(verificationAddress, sig, messageToSign)) {
      return { path, index }
    }

  } catch(e) {
    
    return
  }
}

export async function getAllUsedWalletIpfsPaths() {
  return await localforage.getItem(SIGNUP_USED_IPFS_PATHS) || []
}

export async function storeWalletIpfsPath(signingKey, path, index) {
  const history = await getAllUsedWalletIpfsPaths()
  const updatedHistory = [...history, path]
  
  //TODO God willing: might need to hash this as well so no using an old index, God willing.
  const walletHashHistory = Array.from(new Set(updatedHistory))
  
  //TODO God willing: add version to message so it can be decoded in future, God willing.
  const messageToSign = JSON.stringify({ path, index })
  const signature  = bitbox.BitcoinCash.signMessageWithPrivKey(signingKey, messageToSign);

  //TODO God willing: app shell will only open if signed
  await localforage.setItem(SIGNUP_LAST_USED_IPFS_PATH, { path, index, sig: signature })
  await localforage.setItem(SIGNUP_USED_IPFS_PATHS, walletHashHistory)
}

export async function getRequestedWalletIpfsPath() {
  return await localforage.getItem(SIGNUP_REQUESTED_IPFS_PATH)
}

export async function storeRequestedWalletIpfsPath(path) {
  await localforage.setItem(SIGNUP_REQUESTED_IPFS_PATH, path)
}