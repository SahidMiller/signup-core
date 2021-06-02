import { useEffect, useState } from "preact/hooks";

import fetchIpns from "../utils/fetchIpns";

export default function useGatewayIpns(ipnsAddress) {
  const [latestIpfsPath, setLatestIpfsPath] = useState(null);

  async function checkForIpfsUpdates() {
    const latestAvailableSignupIpfsPath = await fetchIpns(ipnsAddress, false);

    if (latestAvailableSignupIpfsPath) {
      setLatestIpfsPath(latestAvailableSignupIpfsPath);
    }
  }

  useEffect(() => {
    checkForIpfsUpdates();
  }, []);

  return [latestIpfsPath, checkForIpfsUpdates];
}
