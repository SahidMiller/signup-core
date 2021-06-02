import { h, Fragment } from "preact";
import { useContext } from "preact/hooks";
import { slide as Menu } from "react-burger-menu";
import menuStyles from "./menuStyles";
import { css } from "emotion";

import useIpfsAppLoader from "../../hooks/useIpfsAppLoader";

export default function () {
  const { isIpfsPathLoaded } = useIpfsAppLoader();

  return (
    <Menu styles={menuStyles} width={"200px"} right pageWrapId="body-wrap">
      <a href="/">Home</a>
      {isIpfsPathLoaded && [
        <a href="/top-up">Topup</a>,
        <a href="/send">Send</a>,
        <a href="/tokens">Tokens</a>,
        <a href="/NFTs">NFTs</a>,
        <a href="/contributions">Contributions</a>,
        <a href="/backup">Backup</a>,
      ]}
      <a href="/logout">Logout</a>
      <span
        class={css`
          position: absolute;
          bottom: 40px;
          text-align: center;
          font-size: 13px;
        `}
      >
        Support: hello@signup.cash
      </span>
    </Menu>
  );
}
