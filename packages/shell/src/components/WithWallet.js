import { h, createContext } from "preact";
import { useEffect, useState } from "preact/hooks";

import { toast } from "react-toastify";

import { BITCOIN_NETWORK, SIGNUP_WALLET_IPNS, WALLET_HD_PATH, SIGNUP_WALLET_ENTRY_PATH } from '../config'
import { getWalletAddr, checkHasWallets, doesWalletExist, storeWalletIsVerified, storeWallet, storeEncryptedWif, isRecoveryKeyValid, getLastUsedWalletIpfsPath, storeWalletIpfsPath, storeRequestedWalletIpfsPath, getRequestedWalletIpfsPath, getWalletVerificationAddress } from "../utils/wallet";
import fetchIpns from '../utils/fetchIpns'
import loadScript from '../utils/loadScript'
import loadComponent from '../utils/loadComponent'

import * as Sentry from "@sentry/browser";

import { BITBOX } from "bitbox-sdk"
const bitbox = new BITBOX({})

export const WalletContext = createContext({});

const WithWallet = (Component) => {
  function WithWalletComp(props) {

    const [isReady, setIsReady] = useState(false);

    //Wallet data
    const [bchAddr, setBchAddr] = useState();
    const [walletExist, setWalletExist] = useState();
    const [hasWallets, setHasWallets] = useState();
    
    //Wallet content
    const [availableWalletIpfsPath, setAvailableWalletIpfsPath] = useState(false)  
    const [currentWalletIpfsPath, setCurrentWalletIpfsPath] = useState(null)
    const [currentWalletIpfsIndex, setCurrentWalletIpfsIndex] = useState(null)
    const [currentRequestedWalletIpfsPath, setCurrentRequestedWalletIpfsPath] = useState(null)
    const [isWalletIpfsPathLoaded, setIsWalletIpfsPathLoaded] = useState(null)
    const [hasWalletIpfsPathFailedLoad, setHasWalletIpfsPathFailedLoad] = useState(false)
    const [walletComponents, setWalletComponents] = useState()
    
    async function loadWallet(url) {
      try {
        await loadScript(url + SIGNUP_WALLET_ENTRY_PATH)
        
        setWalletComponents(await loadComponent("signupCore", "."))
        setIsWalletIpfsPathLoaded(true)

      } catch (error) {
        console.log(error);
        toast.error("There is an error loading your wallet application!");
        Sentry.captureException(error);
        
        //TODO God willing: if wallet doesn't load, we could technically start from scratch if they want to?
        setHasWalletIpfsPathFailedLoad(true)
      }
    }

    useEffect(async () => {
      if ((hasWalletIpfsPathFailedLoad || isWalletIpfsPathLoaded) && availableWalletIpfsPath && currentWalletIpfsPath !== availableWalletIpfsPath) {
        toast.info("Update available!", {
          onClick: async () => {

            await storeRequestedWalletIpfsPath(availableWalletIpfsPath)
            window.location.reload()
          }
        })
      }
    }, [isWalletIpfsPathLoaded, availableWalletIpfsPath, currentWalletIpfsPath, hasWalletIpfsPathFailedLoad])

    useEffect(async () => {
      if (isReady && !isWalletIpfsPathLoaded && currentWalletIpfsPath && !currentRequestedWalletIpfsPath) {          
        await loadWallet(currentWalletIpfsPath)
      }

    }, [isReady, currentWalletIpfsPath, isWalletIpfsPathLoaded, currentRequestedWalletIpfsPath])

    
    useEffect(() => {
      refetchWallet();
      //TODO God willing: could fetch immediately, God willing, if we handle waiting until we have the current path first from storage/signed, God willing.
      //If one doesn't exist, probably no wallet either (might need to handle that too, God willing)
      //checkForWalletUpdates();
    }, []);

    async function checkForWalletUpdates(currentWalletIpfsPath) {
      const latestAvailableSignupIpfsPath = await fetchIpns(SIGNUP_WALLET_IPNS, false);

      if (latestAvailableSignupIpfsPath && currentWalletIpfsPath !== latestAvailableSignupIpfsPath) {
        setAvailableWalletIpfsPath(latestAvailableSignupIpfsPath)
      }
    }

    async function refetchWallet() {
      const hasWallets = await checkHasWallets();

      if (hasWallets) {
        
        const walletAddr = await getWalletAddr();
        const walletExist = !!walletAddr;
        const verificationAddress = await getWalletVerificationAddress();
        
        //TODO God willing: if deleted then ask user to input a CID, which isn't much dif than allowing to pass ipfs path, God willing.
        //Right now no option if no ipfs is stored, God willing.
        const { path: walletIpfsPath, index: walletIpfsIndex } = await getLastUsedWalletIpfsPath(verificationAddress);
        
        //TODO God willing: fetch to see if user requested an update, show login if so, and remove once signed or reject, God willing.
        const requestedIpfsPath = await getRequestedWalletIpfsPath();
        
        setWalletExist(walletExist);
        setBchAddr(walletAddr);

        //TODO God willing: do not fetch ipfs path/plugins until user approves if it's there, God willing
        setCurrentWalletIpfsPath(walletIpfsPath);
        setCurrentWalletIpfsIndex(walletIpfsIndex);
        setCurrentRequestedWalletIpfsPath(requestedIpfsPath)
        
        //TODO God willing: so that by time they sign up, have a CID already, or else re-request (probably should race, God willing)
        checkForWalletUpdates(walletIpfsPath);

      } else {

        checkForWalletUpdates();
      }

      setHasWallets(hasWallets);
      setIsReady(true)
    }

    async function setSignupAccount(encryptionKey, mnemonic) {
      
      if (!mnemonic || !isRecoveryKeyValid(mnemonic)) {
        toast.error(
          "Your recovery phrases are not valid. Send us an email to hello@signup.cash for assistant if you need."
        );
        return;
      }

      //TODO God willing: validate ipfs path
      let walletIpfsPath = availableWalletIpfsPath
      if (!walletIpfsPath) {
        walletIpfsPath = await checkForWalletUpdates();
      }

      // second check to make sure really no wallet exist here!
      // TODO God willing: if one is setup but no ipfs path (so login showed up), then allow input if they login and sign, God willing.
      // Also, God willing: if a wallet exists, then especially, God willing, allow logouts in app shell.
      const walletExist = await doesWalletExist();
      if (walletExist) {
        toast.error("A wallet already exist! You need to logout first.");
        return;
      }
      
      const seedBuffer = bitbox.Mnemonic.toSeed(mnemonic);
      const hdNode = bitbox.HDNode.fromSeed(seedBuffer, BITCOIN_NETWORK);
      const verificationAddress = bitbox.HDNode.toCashAddress(hdNode)
      const accountRecieveKey = bitbox.HDNode.derivePath(hdNode, WALLET_HD_PATH);
      
      const wif = hdNode.keyPair.toWIF()
      
      await storeEncryptedWif(encryptionKey, verificationAddress, wif)
      await storeWallet(accountRecieveKey)
      await storeWalletIsVerified();
      await storeWalletIpfsPath(wif, walletIpfsPath, 1);

      await loadWallet(walletIpfsPath)
      setIsWalletIpfsPathLoaded(true)

      refetchWallet()
    }

    return (
      <WalletContext.Provider value={{ 
        isReady, 
        hasWallets,
        walletExist, 
        bchAddr, 
        currentWalletIpfsPath, 
        currentWalletIpfsIndex,
        availableWalletIpfsPath,
        // TODO God willing: use this to show special login screen for permission once page is reloaded, God willing, and before plugins restored, God willing
        currentRequestedWalletIpfsPath, 
        isWalletIpfsPathLoaded,
        walletComponents,

        setSignupAccount, 
        refetchWallet, 
        checkForWalletUpdates 
      }}>
        {<Component {...props} />}
      </WalletContext.Provider>
    );
  }
  return WithWalletComp;
};

export default WithWallet;