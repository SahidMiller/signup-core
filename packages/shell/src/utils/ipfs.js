const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import localforage from "localforage";
import {
  SIGNUP_USED_IPFS_PATHS,
  SIGNUP_LAST_USED_IPFS_PATH,
  SIGNUP_REQUESTED_IPFS_PATH,
} from "../config";

export async function getLastUsedIpfsPath(verificationAddress) {
  try {
    //TODO God willing: store version so we can decode properly on upgrade, God willing.
    const { path, sig, index } = await localforage.getItem(
      SIGNUP_LAST_USED_IPFS_PATH
    );
    const messageToSign = JSON.stringify({ path, index });

    if (
      bitbox.BitcoinCash.verifyMessage(verificationAddress, sig, messageToSign)
    ) {
      return { path, index };
    }
  } catch (e) {
    return;
  }
}

export async function getAllUsedIpfsPaths() {
  return (await localforage.getItem(SIGNUP_USED_IPFS_PATHS)) || [];
}

export async function storeIpfsPath(signingKey, path, index) {
  const history = await getAllUsedIpfsPaths();
  const updatedHistory = [...history, path];

  //TODO God willing: might need to hash this as well so no using an old index, God willing.
  const walletHashHistory = Array.from(new Set(updatedHistory));

  //TODO God willing: add version to message so it can be decoded in future, God willing.
  const messageToSign = JSON.stringify({ path, index });
  const signature = bitbox.BitcoinCash.signMessageWithPrivKey(
    signingKey,
    messageToSign
  );

  //TODO God willing: app shell will only open if signed
  await localforage.setItem(SIGNUP_LAST_USED_IPFS_PATH, {
    path,
    index,
    sig: signature,
  });
  await localforage.setItem(SIGNUP_USED_IPFS_PATHS, walletHashHistory);
}

export async function getRequestedIpfsPath() {
  return await localforage.getItem(SIGNUP_REQUESTED_IPFS_PATH);
}

export async function storeRequestedIpfsPath(path) {
  await localforage.setItem(SIGNUP_REQUESTED_IPFS_PATH, path);
}

export async function updateIpfsPath(wif, requestedPath, index) {
  if (!wif) return false;

  try {
    await storeRequestedIpfsPath(wif, requestedPath, index + 1);
    await storeRequestedIpfsPath(null);
    return true;
  } catch (err) {
    return false;
  }
}

export async function deleteIpfsPaths() {
  await localforage.setItem(SIGNUP_REQUESTED_IPFS_PATH);
  await localforage.setItem(SIGNUP_USED_IPFS_PATHS);
  await localforage.setItem(SIGNUP_LAST_USED_IPFS_PATH);
}
