import localforage from "localforage";
import passworder from "browser-passworder";
import { BITCOIN_NETWORK, WALLET_HD_PATH } from "../config";

const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

export async function findAccount(key) {
  const encryptedAccounts =
    (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];
  return (
    encryptedAccounts.length &&
    (await Promise.any(
      encryptedAccounts.map((encryptedAccount) =>
        passworder.decryptWithKey(key, encryptedAccount)
      )
    ))
  );
}

//Persisted, God willing, for each account. Encrypted.
export async function storeEncryptedAccount(encryptionKey, account) {
  const encryptedAccount = await passworder.encryptWithKey(
    encryptionKey,
    account
  );
  const encryptedAccounts =
    (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];

  await localforage.setItem("SIGNUP_ACCOUNTS", [
    ...encryptedAccounts,
    encryptedAccount,
  ]);
}

//Used to show login
export async function checkHasAccounts() {
  return !!((await localforage.getItem("SIGNUP_ACCOUNTS")) || []).length;
}

export async function createAccountFromMnemonic(mnemonic, manifest) {
  //TODO God willing: allow user to choose which keypair to use for signing, God willing
  const seedBuffer = bitbox.Mnemonic.toSeed(mnemonic);
  const hdNode = bitbox.HDNode.fromSeed(seedBuffer, BITCOIN_NETWORK);

  const wif = bitbox.HDNode.toWIF(hdNode);
  const xpriv = bitbox.HDNode.toXPriv(hdNode);
  const verificationAddress = bitbox.HDNode.toCashAddress(hdNode);

  const accountRecieveNode = bitbox.HDNode.derivePath(hdNode, WALLET_HD_PATH);
  const accountRecieveKeyWif = bitbox.HDNode.toWIF(accountRecieveNode);
  const account = {
    recieveKey: accountRecieveKeyWif,
    verificationAddress: verificationAddress,
    manifest,
  };

  return { wif, xpriv, account };
}

//TODO God willing: verify the xpirv matches the account, God willing.
export async function updateAccount(xpriv, account, manifest) {
  const hdNode = bitbox.HDNode.fromXPriv(xpriv);
  const wif = bitbox.HDNode.toWIF(hdNode);
  const verificationAddress = bitbox.HDNode.toCashAddress(hdNode);

  const accountRecieveNode = bitbox.HDNode.derivePath(hdNode, WALLET_HD_PATH);
  const accountRecieveKeyWif = bitbox.HDNode.toWIF(accountRecieveNode);

  if (
    account.recieveKey === accountRecieveKeyWif &&
    account.verificationAddress === verificationAddress
  ) {
    return { wif, account: { ...account, manifest } };
  }
}
