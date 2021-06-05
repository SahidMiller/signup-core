import { useContext, useState } from "preact/hooks";
import { storeRequestedIpfsPath, storeSession } from "../utils/session";
import {
  findAccount,
  storeEncryptedAccount,
  updateAccount,
} from "../utils/accounts";
import passworder from "browser-passworder";
import useIpfsAppLoader from "./useIpfsAppLoader";
import { route } from "preact-router";

export default function useUpgradeIpfsPath() {
  const { currentIpfsIndex, requestedIpfsPath } = useIpfsAppLoader();
  const [allowUpgrade, setAllowUpgrade] = useState(null);

  const onAuthentication = async (email, password) => {
    if (!allowUpgrade) {
      await storeRequestedIpfsPath(null);
      window.location.reload();
    } else {
      const key = await passworder.keyFromPassword(password, btoa(email));
      const { xpriv, account: originalAccount } =
        (await findAccount(key)) || {};

      if (!xpriv || !originalAccount) {
        throw "Invalid login";
      }

      const { wif, account } =
        updateAccount(xpriv, originalAccount, {
          wallet: requestedIpfsPath,
          index: currentIpfsIndex + 1,
        }) || {};

      if (!wif || !account) {
        throw "Invalid login";
      }

      try {
        await storeSession(wif, account);
        await storeEncryptedAccount(key, { xpriv, account });

        //TODO God willing: Better transition?
        route("/", true);
        window && window.location.reload();
      } catch (err) {
        //TODO God willing: handle failed to save for some reason.
      }
    }
  };

  return [setAllowUpgrade, requestedIpfsPath, onAuthentication];
}
