import { useEffect } from "preact/hooks";

import { storeRequestedIpfsPath } from "../utils/ipfs";

import { toast } from "react-toastify";

export default function useIpfsUpdateToaster(
  latestIpfsPath,
  currentIpfsPath,
  isIpfsPathLoaded,
  hasIpfsPathFailedLoad
) {
  //Show toast when ipfs path fetch is complete and update is available
  useEffect(async () => {
    const hasCompletedFetch = hasIpfsPathFailedLoad || isIpfsPathLoaded;

    if (
      hasCompletedFetch &&
      latestIpfsPath &&
      currentIpfsPath !== latestIpfsPath
    ) {
      toast.info("Update available!", {
        onClick: async () => {
          await storeRequestedIpfsPath(latestIpfsPath);
          window && window.location.reload();
        },
      });
    }
  }, [
    currentIpfsPath,
    isIpfsPathLoaded,
    hasIpfsPathFailedLoad,
    latestIpfsPath,
  ]);
}
