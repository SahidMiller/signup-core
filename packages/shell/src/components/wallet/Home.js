import { h, Fragment } from "preact";
import { css } from "emotion";

import useIpfsAppLoader from "../../hooks/useIpfsAppLoader";
import useWallet from "../../hooks/useWallet";

import Authenticate from "./Authenticate";
import AuthenticateUpgrade from "./authentication/AuthenticateUpgrade";
import Menu from "./Menu";
import Avatar from "./Avatar";

export default function ({ clientPayload }) {
  const { isLoggedIn, isWalletReady } = useWallet();
  const { isIpfsPathLoaded, walletComponents, requestedIpfsPath } =
    useIpfsAppLoader();

  const isWalletLoaded = isWalletReady && isLoggedIn && isIpfsPathLoaded;

  return (
    <>
      {isWalletLoaded && !!isLoggedIn && (
        <header style="min-height:40px;">
          <Avatar />
          <Menu />
        </header>
      )}

      {!isWalletLoaded && (
        <main>
          {!isWalletReady && (
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

          {isWalletReady && !isLoggedIn && <Authenticate />}

          {isWalletReady && !!requestedIpfsPath && <AuthenticateUpgrade />}
        </main>
      )}

      {isWalletLoaded && (
        <walletComponents.AppRouter clientPayload={clientPayload} />
      )}
    </>
  );
}
