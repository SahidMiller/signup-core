import { h, Fragment } from "preact";

import useIpfsAppLoader from "../../hooks/useIpfsAppLoader";

import Avatar from "../common/Avatar";

export default function () {
  const { currentIpfsIndex, verificationAddress } = useIpfsAppLoader();

  return <Avatar uniqueId={verificationAddress} index={currentIpfsIndex} />;
}
