import { h, createContext } from "preact";
import { useEffect, useState, useContext } from "preact/hooks";

import { getSession } from "../utils/session";
import { checkHasAccounts } from "../utils/accounts";
import { getRequestedIpfsPath, storeRequestedIpfsPath } from "../utils/session";

const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

const WalletContext = createContext({});

function _useWallet() {
  const [isReady, setIsReady] = useState(false);

  //Wallet data
  const [currentSession, setCurrentSession] = useState(null);
  const [hasAccounts, setHasAccounts] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does.
  useEffect(() => {
    fetchSavedWallet();
  }, []);

  async function fetchSavedWallet() {
    const hasAccounts = await checkHasAccounts();

    if (hasAccounts) {
      const currentAccount = await getSession();

      setIsLoggedIn(!!currentAccount);

      if (currentAccount) {
        const { recieveKey, verificationAddress, manifest } = currentAccount;

        //TODO God willing: index or name, coin, etc. of hdnode.
        const hdNode = bitbox.ECPair.fromWIF(recieveKey);
        const bchAddr = bitbox.ECPair.toCashAddress(hdNode);

        //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does.
        setCurrentSession({
          bchAddr,
          hdNode,
          verificationAddress,
          manifest,
          requestedPluginUpdate: await getRequestedIpfsPath(),
        });

        storeRequestedIpfsPath(undefined);
      }
    }

    setHasAccounts(hasAccounts);
    setIsReady(true);
  }

  return [isReady, hasAccounts, isLoggedIn, currentSession, fetchSavedWallet];
}

export default function useWallet() {
  return useContext(WalletContext);
}

export function WithWallet(Component) {
  function WithWalletComp(props) {
    const [
      isWalletReady,
      hasAccounts,
      isLoggedIn,
      currentSession,
      refetchWallet,
    ] = _useWallet();

    return (
      <WalletContext.Provider
        value={{
          isWalletReady,
          hasAccounts,
          isLoggedIn,
          currentSession,
          refetchWallet,
        }}
      >
        {<Component {...props} />}
      </WalletContext.Provider>
    );
  }

  return WithWalletComp;
}
