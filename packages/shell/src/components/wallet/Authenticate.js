import { h, Fragment } from "preact";
import useWallet from "../../hooks/useWallet";

import Logo from "../common/Logo";
import Button from "../common/Button";
import Heading from "../common/Heading";
import Article from "../common/Article";

export default function () {
  const { hasAccounts } = useWallet();

  return (
    <>
      <Article ariaLabel="Login or register">
        <Logo slp />
        <p>
          Signup is a non-custodial <b>Bitcoin Cash</b> wallet. With Signup you
          can interact with different web apps, own SLP tokens and NFTs or just
          send and recieve BCH in web.
        </p>

        {hasAccounts && (
          <Button linkTo={"/login"} primary>
            Login
          </Button>
        )}

        <Button linkTo={"/register"} secondary>
          Create or import a wallet
        </Button>

        <Heading number={4}>
          No backend is used at all in this application.
        </Heading>
      </Article>
    </>
  );
}
