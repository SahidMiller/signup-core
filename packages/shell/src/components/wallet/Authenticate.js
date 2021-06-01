import { h, Fragment } from "preact";
import { useContext, useState } from "preact/hooks"
import { css } from "emotion";
import Logo from "../common/Logo";
import Button from "../common/Button";
import Heading from "../common/Heading";
import Article from "../common/Article";

import { WalletContext } from "../WithWallet";

export default function () {
  const { hasWallets, walletExist } = useContext(WalletContext)
  
  return (
    <>
      <Article ariaLabel="Login or register">
        <Logo slp />
        <p>
          Signup is a non-custodial <b>Bitcoin Cash</b> wallet. With Signup you
          can interact with different web apps, own SLP tokens and NFTs or just
          send and recieve BCH in web.
        </p>
        
        { hasWallets && <Button linkTo={"/login"} primary>
          Login
        </Button> }

        <Button linkTo={"/register"} secondary>
          Create or import a wallet
        </Button>

        <Heading number={4}>No backend is used at all in this application.</Heading>

      </Article>
    </>
  );
}
