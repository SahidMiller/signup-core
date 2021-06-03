import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Link, route } from "preact-router";

import useWallet from "../../hooks/useWallet";

import Logo from "../common/Logo";
import Button from "../common/Button";
import Article from "../common/Article";
import Login from "../common/Login";

import { findAccount } from "../../utils/accounts";
import { storeSession } from "../../utils/session";

import passworder from "browser-passworder";
import Heading from "../common/Heading";
import { css } from "emotion";

const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

export default function () {
  const { isLoggedIn, refetchWallet } = useWallet();
  const [loginPending, setLoginPending] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  setLoginAttempted((loginAttempted) => loginAttempted || loginPending);

  useEffect(() => {
    isLoggedIn && route("/", true);
  }, [isLoggedIn]);

  async function handleLogin(email, password) {
    setLoginPending(true);

    try {
      const key = await passworder.keyFromPassword(password, btoa(email));
      const { xpriv, account } = await findAccount(key);
      const hdNode = bitbox.HDNode.fromXPriv(xpriv);
      const wif = bitbox.HDNode.toWIF(hdNode);

      await storeSession(wif, account);
      await refetchWallet();
    } finally {
      setLoginPending(false);
    }
  }

  return (
    <>
      <Article ariaLabel="Login">
        <Logo slp />
        <Login onLogin={handleLogin}>
          {(isDisabled) => (
            <>
              <Button type="submit" disabled={isDisabled} primary>
                {!loginPending ? "Login" : "Logging in..."}
              </Button>
              {loginAttempted && !loginPending && (
                <Heading
                  highlight
                  number={5}
                  customCss={css`
                    margin: 30px 20px !important;
                    background: #f74476;
                  `}
                >
                  Incorrect email or password for saved account. Please{" "}
                  <u>try again</u>!
                </Heading>
              )}
            </>
          )}
        </Login>
      </Article>
      <footer style="margin-top:20px">
        <Link href="/">{"< Back"}</Link>
      </footer>
    </>
  );
}
