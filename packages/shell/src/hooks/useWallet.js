import { h, createContext } from "preact";
import { useEffect, useState, useContext } from "preact/hooks";

import useIpfsAppLoader, { WithIpfsAppLoader } from "../hooks/useIpfsAppLoader";

import { getWalletAddr, checkHasWallets } from "../utils/wallet";

const WalletContext = createContext({});

function _useWallet() {
  const [isReady, setIsReady] = useState(false);

  //Wallet data
  const [bchAddr, setBchAddr] = useState();
  const [walletExist, setWalletExist] = useState();
  const [hasWallets, setHasWallets] = useState();

  //TODO God willing: handle if ipfs path doesn't exist and/or currentIpfsPath doesn't exist but wallet does
  useEffect(() => {
    fetchSavedWallet();
  }, []);

  async function fetchSavedWallet() {
    const hasWallets = await checkHasWallets();

    if (hasWallets) {
      const walletAddr = await getWalletAddr();
      const walletExist = !!walletAddr;

      setWalletExist(walletExist);
      setBchAddr(walletAddr);
    }

    setHasWallets(hasWallets);
    setIsReady(true);
  }

  return [isReady, hasWallets, walletExist, bchAddr, fetchSavedWallet];
}

export default function useWallet() {
  return useContext(WalletContext);
}

export const WithWallet = (Component) => {
  const WithWalletComp = (props) => {
    const [isWalletReady, hasWallets, walletExist, bchAddr, refetchWallet] =
      _useWallet();

    const { isIpfsReady } = useIpfsAppLoader();

    return (
      <WalletContext.Provider
        value={{
          isReady: isWalletReady && isIpfsReady,
          hasWallets,
          walletExist,
          bchAddr,
          refetchWallet,
        }}
      >
        {<Component {...props} />}
      </WalletContext.Provider>
    );
  };

  return WithIpfsAppLoader(WithWalletComp);
};
