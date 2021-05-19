import "regenerator-runtime";
import { get, set } from 'idb-keyval'
import { SIGNUP_LAST_USED_IPFS_PATH, SIGNUP_LATEST_AVAILABLE_IPFS_PATH } from '../../wallet/src/config'

const isDevEnv = process.env.NODE_ENV === "development"
const IPFS_GATEWAY_HOST = process.env.IPFS_GATEWAY_HOST || "http://gateway.ipfs.io:5001"
const SIGNUP_WALLET_ENTRY_HOST = process.env.SIGNUP_WALLET_ENTRY_HOST
const SIGNUP_WALLET_ENTRY_PATH = process.env.SIGNUP_WALLET_ENTRY_PATH.replace(/^\//, '') || "js/signupCoreEntry.js"
const SIGNUP_WALLET_IPNS = process.env.SIGNUP_WALLET_IPNS

const RESOLVE_IPNS_API_URL = "/api/v0/name/resolve"


async function loadComponent(scope, module) {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__("default");

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
}

async function scriptPromise(src) { 
  
  return await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    document.body.appendChild(script);
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    script.src = src.replace(/\/$/, '') + "/" + SIGNUP_WALLET_ENTRY_PATH
  });
}

async function resolveLatestIpns(address, nocache) {

  const response = await fetch(IPFS_GATEWAY_HOST + RESOLVE_IPNS_API_URL + `?arg=${address}${!!nocache ? '&nocache=true' : ''}`)
  const { Path } = await response.json()
  
  return IPFS_GATEWAY_HOST + Path
}

async function setup() {
  
  //Load the script using env variable if ipfs isn't forced and is dev env
  if (!process.env.FORCE_IPFS && isDevEnv) {
  
    await scriptPromise(SIGNUP_WALLET_ENTRY_HOST)
  
  } else {
    
    //Otherwise, get last used IPFS path OR latest available ipfs path (from configured gateway)
    //TODO God willing, configure gateway to fetch IPNS from
    const lastUsedSignupIpfsPath = await get(SIGNUP_LAST_USED_IPFS_PATH)
    
    const latestAvailableSignupIpfsPath = resolveLatestIpns(SIGNUP_WALLET_IPNS).then(async (ipfsPath) => {
      set(SIGNUP_LATEST_AVAILABLE_IPFS_PATH, ipfsPath)

      //TODO God willing: Plugins could technically set this (and maybe wallet app should), so verify signature?
      if (!lastUsedSignupIpfsPath) {
        await set(SIGNUP_LAST_USED_IPFS_PATH, ipfsPath)
      }

      return ipfsPath
    })

    //Wait for latest available if no last used path
    await scriptPromise(lastUsedSignupIpfsPath || await latestAvailableSignupIpfsPath)
  }

  await loadComponent("SignupCore", ".")
}

setup()