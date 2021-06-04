export const isDevEnv = process.env.NODE_ENV === "development";

const forceIpfs = JSON.parse(process.env.FORCE_IPFS || false);
export const isIpfsEnv = forceIpfs || !isDevEnv;

const defaultHdPath = "m/44'/0'/0'/0/0";
export const BITCOIN_NETWORK = isDevEnv
  ? process.env.BITCOIN_NETWORK || "testnet"
  : "mainnet";
export const WALLET_HD_PATH =
  (isDevEnv && process.env.WALLET_HD_PATH) || defaultHdPath;

export const IPFS_GATEWAY_HOST =
  process.env.IPFS_GATEWAY_HOST || "http://gateway.ipfs.io:5001";
export const SIGNUP_WALLET_ENTRY_HOST = process.env.SIGNUP_WALLET_ENTRY_HOST;

const entryPath = process.env.SIGNUP_WALLET_ENTRY_PATH;
export const SIGNUP_WALLET_ENTRY_PATH = entryPath
  ? entryPath.replace(/^\//, "")
  : "js/signupCoreEntry.js";

export const SIGNUP_WALLET_IPNS = process.env.SIGNUP_WALLET_IPNS;

export const SIGNUP_LAST_USED_IPFS_PATH = "SIGNUP_LAST_USED_IPFS_PATH";
export const SIGNUP_LATEST_AVAILABLE_IPFS_PATH =
  "SIGNUP_LATEST_AVAILABLE_IPFS_PATH";
export const SIGNUP_USED_IPFS_PATHS = "SIGNUP_USED_IPFS_PATHS";
export const SIGNUP_REQUESTED_IPFS_PATH = "SIGNUP_REQUESTED_IPFS_PATH";
