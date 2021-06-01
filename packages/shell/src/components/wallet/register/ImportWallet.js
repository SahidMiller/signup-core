import { h, Fragment } from "preact";
import { useState, useEffect, useContext } from "preact/hooks";
import { Link, route } from "preact-router";

import * as Sentry from "@sentry/browser";
import { toast } from "react-toastify";

import Article from "../../common/Article";
import Heading from "../../common/Heading";
import Input from "../../common/Input";
import Button from "../../common/Button";

import { WalletContext } from "../../WithWallet";

export default function ({ encryptionKey }) {
  const { walletExist, setSignupAccount, refetchWallet, isPendingIpfs } = useContext(WalletContext)
  const [walletMnemonic, setWalletMnemonic] = useState();

  refetchWallet()

  function handleMnemonicInput(e) {
    setWalletMnemonic(e.target.value.trim());
  }

  function handleImport(e) {
    e.preventDefault();

    (async () => {

      try {
        
        await setSignupAccount(encryptionKey, walletMnemonic)

        setTimeout(() => {
          route("/", true);
        }, 1000);

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
            {isPendingIpfs && <Loading text="Fetching latest wallet code ... 🔒" />}
            {walletExist ? (
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
