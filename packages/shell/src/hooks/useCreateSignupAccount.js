import useIpfsAppLoader from "./useIpfsAppLoader";
import useWallet from "./useWallet";

import { deleteSession, storeSession } from "../utils/session";
import { isRecoveryKeyValid } from "../utils/mnemonics";
import {
  createAccountFromMnemonic,
  findAccount,
  storeEncryptedAccount,
} from "../utils/accounts";

import { toast } from "react-toastify";
import { route } from "preact-router";

export default function useCreateSignupAccount() {
  const { latestIpfsPath } = useIpfsAppLoader();
  const { isLoggedIn } = useWallet();

  const createAccount = async (encryptionKey, mnemonic) => {
    //TODO God willing: validate ipfs path
    if (!latestIpfsPath) return;

    if (!mnemonic || !isRecoveryKeyValid(mnemonic)) {
      toast.error(
        "Your recovery phrases are not valid. Send us an email to hello@signup.cash for assistant if you need."
      );
      return;
    }

    // second check to make sure really no wallet exist here!
    if (isLoggedIn) {
      toast.error("A wallet already exist! You need to logout first.");
      return;
    }

    try {
      if (!!(await findAccount(encryptionKey))) {
        toast.error(
          "A wallet already exist for this account! You need to have a unique key."
        );
        return;
      }

      const { wif, xpriv, account } = await createAccountFromMnemonic(
        mnemonic,
        {
          wallet: latestIpfsPath,
          index: 1,
        }
      );

      await storeSession(wif, account);
      await storeEncryptedAccount(encryptionKey, { xpriv, account });

      //TODO God willing: Better transition?
      route("/", true);
      window && window.location.reload();
    } catch (err) {
      await deleteSession();
      throw err;
    }
  };

  return [createAccount, !latestIpfsPath];
}
