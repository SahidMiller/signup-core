import { useEffect, useState } from "preact/hooks";
import { toast } from "react-toastify";

import fetchIpns from "../utils/fetchIpns";

export default function useGatewayIpns(ipnsAddress) {
  const [latestIpfsPath, setLatestIpfsPath] = useState(null);
  const [hasErrored, setHasErrored] = useState(false);

  async function checkForIpfsUpdates() {
    try {
      const latestAvailableSignupIpfsPath = await fetchIpns(ipnsAddress, false);

      if (latestAvailableSignupIpfsPath) {
        setLatestIpfsPath(latestAvailableSignupIpfsPath);
      }
    } catch (ex) {
      if (!hasErrored) {
        console.log(ex);
        toast.error("Error checking for updates!");
        setHasErrored(true);
      }
    }
  }

  useEffect(() => {
    checkForIpfsUpdates();
  }, []);

  return [latestIpfsPath, checkForIpfsUpdates];
}
