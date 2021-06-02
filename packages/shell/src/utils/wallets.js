import localforage from "localforage";
import passworder from "browser-passworder";

export async function findWallet(email, password) {
  const key = await passworder.keyFromPassword(password, btoa(email));
  const encryptedWifs = (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];
  return await Promise.any(
    encryptedWifs.map((encryptedWif) =>
      passworder.decryptWithKey(key, encryptedWif)
    )
  );
}

//Persisted, God willing, for each account. Encrypted.
export async function storeEncryptedWif(encryptionKey, wif) {
  const encryptedWif = await passworder.encryptWithKey(encryptionKey, wif);
  const encryptedWifs = (await localforage.getItem("SIGNUP_ACCOUNTS")) || [];

  await localforage.setItem("SIGNUP_ACCOUNTS", [
    ...encryptedWifs,
    encryptedWif,
  ]);
}

//Used to show login
export async function checkHasWallets() {
  return !!((await localforage.getItem("SIGNUP_ACCOUNTS")) || []).length;
}
