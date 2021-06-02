import { useEffect, useState } from "preact/hooks";

import loadScript from "../utils/loadScript";
import loadComponent from "../utils/loadComponent";
import { SIGNUP_WALLET_ENTRY_PATH } from "../config";

import * as Sentry from "@sentry/browser";
import { toast } from "react-toastify";

export default function useIpfsLoader(
  isReady,
  currentIpfsPath,
  requestedIpfsPath
) {
  const [isIpfsPathLoaded, setIsIpfsPathLoaded] = useState(false);
  const [hasIpfsPathFailedLoad, setHasIpfsPathFailedLoad] = useState(false);
  const [walletComponents, setWalletComponents] = useState();

  async function loadIpfsWallet(url) {
    try {
      await loadScript(url + SIGNUP_WALLET_ENTRY_PATH);

      setWalletComponents(await loadComponent("signupCore", "."));
      setIsIpfsPathLoaded(true);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);

      toast.error("There is an error loading your wallet application!");

      //TODO God willing: if wallet doesn't load, we could technically start from scratch if they want to?
      setHasIpfsPathFailedLoad(true);
    }
  }

  //Load wallet if signed ipfs path exists and not loaded yet, nor if an update was requested
  useEffect(async () => {
    if (isReady && currentIpfsPath && !isIpfsPathLoaded && !requestedIpfsPath) {
      await loadIpfsWallet(currentIpfsPath);
    }
  }, [isReady, currentIpfsPath, isIpfsPathLoaded, requestedIpfsPath]);

  return [isIpfsPathLoaded, hasIpfsPathFailedLoad, walletComponents];
}
