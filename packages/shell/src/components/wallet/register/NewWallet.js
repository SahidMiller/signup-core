import { h, Fragment } from "preact";

import useCreateSignupAccount from "../../../hooks/useCreateSignupAccount";

import ConfirmRecoveryPhrases from "../../common/ConfirmRecoveryPhrases";
import Loading from "../../common/Loading";

import { toast } from "react-toastify";
import * as Sentry from "@sentry/browser";

export default function ({ encryptionKey }) {
  const [createAccount, isPendingIpfs] = useCreateSignupAccount();

  async function onConfirmRecoveryPhrase(mnemonic) {
    try {
      await createAccount(encryptionKey, mnemonic);
    } catch (e) {
      console.log(e);
      toast.error("There is an error while importing your wallet!");
      Sentry.captureException(e);
    }
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
