import { h, Fragment } from "preact";

import useIpfsAppLoader from "../../hooks/useIpfsAppLoader";
import useWallet from "../../hooks/useWallet";

import Avatar from "../common/Avatar";

export default function () {
  const { bchAddr } = useWallet();
  const { currentIpfsIndex } = useIpfsAppLoader();

  return <Avatar uniqueId={bchAddr} index={currentIpfsIndex} />;
}
