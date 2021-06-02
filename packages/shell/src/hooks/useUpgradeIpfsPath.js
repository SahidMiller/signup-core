import { useContext, useState } from "preact/hooks";
import { storeRequestedIpfsPath, updateIpfsPath } from "../utils/ipfs";

export default function useUpgradeIpfsPath() {
  const { currentIpfsIndex, currentRequestedIpfsPath } =
    useContext(IpfsContext);
  const [allowUpgrade, setAllowUpgrade] = useState(null);

  const onAuthentication = (email, password) => {
    if (!allowUpgrade) {
      await storeRequestedIpfsPath(null);
      window.location.reload();
    } else {
      const succeeded = await updateIpfsPath(
        email,
        password,
        currentRequestedIpfsPath,
        currentIpfsIndex
      );

      if (succeeded) {
        window.location.reload();
      } else {
        //TODO God willing: handle failed to save for some reason.
      }
    }
  };

  return [setAllowUpgrade, currentRequestedIpfsPath, onAuthentication];
}
