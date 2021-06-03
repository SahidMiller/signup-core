import { h, Fragment } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { Link, route } from "preact-router";

import useCreateSignupAccount from "../../../hooks/useCreateSignupAccount";
import useWallet from "../../../hooks/useWallet";

import Article from "../../common/Article";
import Heading from "../../common/Heading";
import Input from "../../common/Input";
import Button from "../../common/Button";
import Loading from "../../common/Loading";

import * as Sentry from "@sentry/browser";
import { toast } from "react-toastify";

export default function ({ encryptionKey }) {
  const { isLoggedIn, refetchWallet } = useWallet();
  const [createAccount, isPendingIpfs] = useCreateSignupAccount();
  const [walletMnemonic, setWalletMnemonic] = useState();

  refetchWallet();

  function handleMnemonicInput(e) {
    setWalletMnemonic(e.target.value.trim());
  }

  function handleImport(e) {
    e.preventDefault();

    (async () => {
      try {
        await createAccount(encryptionKey, walletMnemonic);
      } catch (e) {
        console.log(e);
        toast.error("There is an error while importing your wallet!");
        Sentry.captureException(e);
      }
    })();
  }

  return (
    <>
      <header>
        <Link href="/">{`< Back to Home`}</Link>
      </header>
      <main>
        <form onSubmit={handleImport}>
          <Article ariaLabel="Import Your Wallet">
            <Heading number={2}>Import Your Wallet</Heading>
            {isPendingIpfs && (
              <Loading text="Fetching latest wallet code ... 🔒" />
            )}
            {isLoggedIn ? (
              <p>
                You already have an active wallet. If you want to import a new
                one, you have to log out from the previous one. Use the menu on
                the right side to log out and make sure you have a backup before
                doing so. 🔒
              </p>
            ) : (
              <>
                <Input
                  placeholder="here is the place for your recovery phrases"
                  onChange={handleMnemonicInput}
                  value={walletMnemonic}
                />

                <Button type="submit" primary>
                  Import Wallet
                </Button>
              </>
            )}
          </Article>
        </form>
      </main>
    </>
  );
}
