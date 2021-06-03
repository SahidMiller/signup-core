import { h, createContext } from "preact";
import { useContext } from "preact/hooks";

import useIpfsUpdateToaster from "../hooks/useIpfsUpdateToaster";
import useIpfsLoader from "../hooks/useIpfsLoader";
import useGatewayIpns from "./useGatewayIpns";
import useWallet, { WithWallet } from "./useWallet";

import { SIGNUP_WALLET_IPNS } from "../config";

const IpfsAppContext = createContext({});

function _useIpfsAppLoader() {
  const { isWalletReady, currentSession } = useWallet();

  const {
    manifest,
    verificationAddress,
    requestedPath: requestedIpfsPath,
  } = currentSession || {};

  const { wallet: currentIpfsPath, index: currentIpfsIndex } = manifest || {};

  const [isIpfsPathLoaded, hasIpfsPathFailedLoad, walletComponents] =
    useIpfsLoader(isWalletReady, currentIpfsPath, requestedIpfsPath);
  const [latestIpfsPath, checkForIpfsUpdates] =
    useGatewayIpns(SIGNUP_WALLET_IPNS);

  useIpfsUpdateToaster(
    latestIpfsPath,
    currentIpfsPath,
    isIpfsPathLoaded,
    hasIpfsPathFailedLoad
  );

  return [
    verificationAddress,
    currentIpfsPath,
    currentIpfsIndex,
    requestedIpfsPath,
    latestIpfsPath,
    isIpfsPathLoaded,
    walletComponents,
    checkForIpfsUpdates,
  ];
}

export default function useIpfsAppLoader() {
  return useContext(IpfsAppContext);
}

export function WithIpfsAppLoader(Component) {
  return WithWallet((props) => {
    const [
      verificationAddress,
      currentIpfsPath,
      currentIpfsIndex,
      requestedIpfsPath,
      latestIpfsPath,
      isIpfsPathLoaded,
      walletComponents,
      checkForIpfsUpdates,
    ] = _useIpfsAppLoader();

    return (
      <IpfsAppContext.Provider
        value={{
          verificationAddress,
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
  });
}
