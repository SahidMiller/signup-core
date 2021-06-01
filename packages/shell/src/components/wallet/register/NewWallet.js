import { h, Fragment } from "preact";
import { useContext } from "preact/hooks"

import { toast } from "react-toastify";
import { route } from "preact-router";
import * as Sentry from "@sentry/browser";

import ConfirmRecoveryPhrases from "../../common/ConfirmRecoveryPhrases";
import { WalletContext } from "../../WithWallet";

export default function ({ encryptionKey }) {
  const { setSignupAccount, isPendingIpfs } = useContext(WalletContext)

  async function onConfirmRecoveryPhrase(mnemonic) {
    setSignupAccount(encryptionKey, mnemonic).then(() => {

      setTimeout(() => {
        route("/", true);
      }, 1000);
    }).catch((e) => {
      console.log(e);
      toast.error("There is an error while creating your wallet!");
      Sentry.captureException(e);
    });
  }

  return (
    <>
      <main>
        {isPendingIpfs && <Loading text="Fetching latest wallet code ... 🔒" />}
        <ConfirmRecoveryPhrases onConfirm={onConfirmRecoveryPhrase} />
      </main>
    </>
  );
}