import { h, Fragment } from "preact";
import { Link, route } from "preact-router";

import useWallet from "../../hooks/useWallet";

import Logo from "../common/Logo";
import Button from "../common/Button";
import Article from "../common/Article";
import Login from "../common/Login";

export default function () {
  const { hasWalletsStored, walletExist } = useWallet();

  function handleLogin(email, password) {}

  return (
    <>
      <Article ariaLabel="Login">
        <Logo slp />
        <Login onLogin={handleLogin}>
          {(isDisabled) => (
            <>
              <Button type="submit" disabled={isDisabled} primary>
                Login
              </Button>
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
