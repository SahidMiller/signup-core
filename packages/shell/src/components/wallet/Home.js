import { h, Fragment } from "preact";
import { css } from "emotion";

import useIpfsAppLoader from "../../hooks/useIpfsAppLoader";
import useWallet from "../../hooks/useWallet";

import Authenticate from "./Authenticate";
import AuthenticateUpgrade from "./authentication/AuthenticateUpgrade";
import Menu from "./Menu";
import Avatar from "./Avatar";

export default function ({ clientPayload }) {
  //TODO God willing: strategy to meet need for security when old sigs can still be used, God willing.
  const { walletExist, isReady } = useWallet();
  const { isIpfsPathLoaded, walletComponents, currentRequestedIpfsPath } =
    useIpfsAppLoader();

  const isWalletReady = isReady && walletExist && isIpfsPathLoaded;

  return (
    <>
      {isReady && !!walletExist && (
        <header>
          <Avatar />
          <Menu />
        </header>
      )}

      {!isWalletReady && (
        <main>
          {!isReady && (
            <div
              class={css`
                text-align: center;
                color: #7c3aed;
              `}
            >
              Opening your wallet ... 🔒
              <p
                class={css`
                  font-size: 12px;
                  margin: 20px;
                  font-weight: 300;
                  color: black;
                `}
              >
                This might take a few seconds...
              </p>
            </div>
          )}

          {isReady && !walletExist && <Authenticate />}

          {isReady && !!currentRequestedIpfsPath && <AuthenticateUpgrade />}
        </main>
      )}

      {isWalletReady && (
        <walletComponents.AppRouter clientPayload={clientPayload} />
      )}
    </>
  );
}
