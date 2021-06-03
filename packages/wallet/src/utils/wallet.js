const slpjs = require("slpjs");
const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

import * as Sentry from "@sentry/browser";
import localforage from "localforage";

function q(selector, el) {
  if (!el) {
    el = document;
  }
  return el.querySelector(selector);
}

export async function getWalletWif() {
  //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does or vice versa.
  const account = await localforage.getItem("SIGNUP_LOGGEDIN_ACCOUNT");
  const wif = account && account.account && account.account.recieveKey;
  return wif;
}

export async function getWalletKeypair() {
  const wif = await getWalletWif();
  return wif && bitbox.ECPair.fromWIF(wif);
}

export async function doesWalletExist() {
  return Boolean(await getWalletKeypair());
}

export async function getWalletAddr() {
  const keypair = await getWalletKeypair();
  return keypair && bitbox.ECPair.toCashAddress(keypair);
}

export async function getWalletSLPAddr() {
  const bchAddr = await getWalletAddr();
  return slpjs.Utils.toSlpAddress(bchAddr);
}

export async function getWalletHdNode() {
  const wif = await getWalletWif();
  return wif && bitbox.HDNode.fromWIF(wif);
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

  const wif = await getWalletWif();
  const bchAddr =
    wif && bitbox.ECPair.toCashAddress(bitbox.ECPair.fromWIF(wif));

  const signature = bitbox.BitcoinCash.signMessageWithPrivKey(
    wif,
    JSON.stringify(payload)
  );

  return {
    signature,
    payload,
    bchAddr,
  };
}

export async function storeSpending(sessionId, amountInSats) {
  try {
    let spendings = await localforage.getItem("SIGNUP_SPENDINGS");
    if (spendings) {
      spendings = JSON.parse(spendings);
    } else {
      spendings = {};
    }

    const pastSpendings = spendings[sessionId]
      ? parseInt(spendings[sessionId].spent)
      : 0;

    spendings[sessionId] = {
      spent: pastSpendings + amountInSats,
      lastUsed: Date.now(),
    };
    await localforage.setItem("SIGNUP_SPENDINGS", JSON.stringify(spendings));
    return Promise.resolve();
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return Promise.reject("[SIGNUP] Failed to store spending");
  }
}

export async function getWalletSpendingsBySessionId(sessionId) {
  try {
    let spendings = await localforage.getItem("SIGNUP_SPENDINGS");
    spendings = JSON.parse(spendings);
    return (spendings[sessionId] && spendings[sessionId].spent) || 0;
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return 0;
  }
}

export async function getFrozenUtxos() {
  try {
    const frozenUtxos = await localforage.getItem("SIGNUP_LOCKED_UTXOS");
    return frozenUtxos ? JSON.parse(frozenUtxos) : {};
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);
    return {};
  }
}

export async function freezeUtxo(txid, vout, reqType, data) {
  try {
    return await freezeUtxos([{ txid, vout }], reqType, data);
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);

    return {};
  }
}

export async function freezeUtxos(utxos, reqType, data) {
  let lockedUtxos = {};

  try {
    lockedUtxos = await getFrozenUtxos();

    utxos.forEach(({ txid, vout }) => {
      //Remove any duplicates before adding again
      const lockedUtxosForTx = (lockedUtxos[txid] || []).filter(
        (outpoint) => outpoint.vout !== vout
      );
      lockedUtxos[txid] = [...lockedUtxosForTx, { txid, vout, reqType, data }];
    });

    await localforage.setItem(
      "SIGNUP_LOCKED_UTXOS",
      JSON.stringify(lockedUtxos)
    );

    return lockedUtxos;
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);

    return lockedUtxos;
  }
}

export async function unfreezeUtxo(txid, vout) {
  try {
    return await unfreezeUtxos([{ txid, vout }]);
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);

    return {};
  }
}

export async function unfreezeUtxos(utxos) {
  let lockedUtxos = {};

  try {
    lockedUtxos = await getFrozenUtxos();

    utxos.forEach(({ txid, vout }) => {
      //Remove from txid
      const lockedUtxosForTx = (lockedUtxos[txid] || []).filter(
        (outpoint) => outpoint.vout !== vout
      );

      if (!lockedUtxosForTx.length) {
        delete lockedUtxos[txid];
      } else {
        lockedUtxos[txid] = lockedUtxosForTx;
      }
    });

    await localforage.setItem(
      "SIGNUP_LOCKED_UTXOS",
      JSON.stringify(lockedUtxos)
    );

    return lockedUtxos;
  } catch (e) {
    console.log(e);
    Sentry.captureException(e);

    return lockedUtxos;
  }
}
