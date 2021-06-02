import { h, createContext } from "preact";
import { useEffect, useState, useContext } from "preact/hooks";

import { checkHasWallets, getWalletVerificationAddress } from "../utils/wallet";
import { getLastUsedIpfsPath, getRequestedIpfsPath } from "../utils/ipfs";

import useIpfsUpdateToaster from "../hooks/useIpfsUpdateToaster";
import useIpfsLoader from "../hooks/useIpfsLoader";
import useGatewayIpns from "./useGatewayIpns";
import { SIGNUP_WALLET_IPNS } from "../config";

const IpfsAppContext = createContext({});

function useIpfsAppLoader() {
  const [isReady, setIsReady] = useState(false);

  const [currentIpfsPath, setCurrentIpfsPath] = useState(null);
  const [currentIpfsIndex, setCurrentIpfsIndex] = useState(null);
  const [requestedIpfsPath, setRequestedIpfsPath] = useState(null);
  const [isIpfsPathLoaded, hasIpfsPathFailedLoad, walletComponents] =
    useIpfsLoader(isReady, currentIpfsPath, requestedIpfsPath);
  const [latestIpfsPath, checkForIpfsUpdates] =
    useGatewayIpns(SIGNUP_WALLET_IPNS);

  useIpfsUpdateToaster(
    latestIpfsPath,
    currentIpfsPath,
    isIpfsPathLoaded,
    hasIpfsPathFailedLoad
  );

  async function fetchSavedIpfsWallet() {
    const hasWallets = await checkHasWallets();

    if (hasWallets) {
      const verificationAddress = await getWalletVerificationAddress();

      //TODO God willing: handle if deleted by asking user to input a CID
      //TODO God willing: also allow user to pass in ipfs path in general
      //TODO God willing: handle when nothing returned?
      const { path, index } = await getLastUsedIpfsPath(verificationAddress);

      //Fetches to see if user requested an update
      const requestedPath = await getRequestedIpfsPath();

      //Does not fetch ipfs path/plugins until user approves if it's there, God willing
      setCurrentIpfsPath(path);
      setCurrentIpfsIndex(index);
      setRequestedIpfsPath(requestedPath);
    }

    checkForIpfsUpdates();
    setIsReady(true);
  }

  //TODO God willing: Load existing signed path and public key, God willing.
  //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does.
  useEffect(() => {
    fetchSavedIpfsWallet();
    checkForIpfsUpdates();
  }, []);

  return [
    isReady,
    currentIpfsPath,
    currentIpfsIndex,
    requestedIpfsPath,
    latestIpfsPath,
    isIpfsPathLoaded,
    walletComponents,
    checkForIpfsUpdates,
  ];
}

export default function () {
  return useContext(IpfsAppContext);
}

export const WithIpfsAppLoader = (Component) => (props) => {
  const [
    isIpfsReady,
    currentIpfsPath,
    currentIpfsIndex,
    requestedIpfsPath,
    latestIpfsPath,
    isIpfsPathLoaded,
    walletComponents,
    checkForIpfsUpdates,
  ] = useIpfsAppLoader();

  return (
    <IpfsAppContext.Provider
      value={{
        isIpfsReady,
        currentIpfsPath,
        currentIpfsIndex,
        requestedIpfsPath,
        latestIpfsPath,
        isIpfsPathLoaded,
        walletComponents,
        checkForIpfsUpdates,
      }}
    >
      <Component {...props} />
    </IpfsAppContext.Provider>
  );
};
