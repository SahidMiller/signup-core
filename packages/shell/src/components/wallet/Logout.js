import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { Link, route } from "preact-router";
import { css } from "emotion";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/browser";
import { deleteSession } from "../../utils/session";
import Logo from "../common/Logo";
import Article from "../common/Article";
import Heading from "../common/Heading";
import Button from "../common/Button";

import useWallet from "../../hooks/useWallet";

export default function () {
  const { isLoggedIn } = useWallet();
  const [wasInitiallyLoggedOut] = useState(() => !isLoggedIn);
  const [isLoggedOut, setIsLoggedOut] = useState(() => !isLoggedIn);

  function redirectHome() {
    route("/", true);
    window && window.location.reload();
  }

  useEffect(() => {
    if (wasInitiallyLoggedOut) {
      redirectHome();
    } else if (isLoggedOut) {
      setTimeout(redirectHome, 1000);
    }
  }, [isLoggedOut, wasInitiallyLoggedOut]);

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await deleteSession();
      setIsLoggedOut(true);
    } catch (e) {
      toast.error(
        "Some error happened! This is strange but you're still not logged in. Please contact us at hello@signup.cash for help"
      );
      Sentry.captureException(e);
    }
  }

  return (
    <>
      <header>
        {!isLoggedOut && <Link href="/">{`< Back to Wallet`}</Link>}
      </header>
      <main>
        {!wasInitiallyLoggedOut && isLoggedOut ? (
          <Article ariaLabel="Logout Form Your Wallet">
            <Heading number={2}>All good! 😇</Heading>
            <p
              class={css`
                padding: 16px;
              `}
            >
              You are logged out.
            </p>
          </Article>
        ) : (
          <form onSubmit={(e) => handleLogout(e)}>
            <Article ariaLabel="Logout Form Your Wallet">
              <Heading number={2}>Logging out</Heading>
              <p
                class={css`
                  padding: 16px;
                `}
              >
                Are you sure you want to log out? If you don't have your
                recovery key <b>you will lose access to your funds!</b>
              </p>

              <Button type="submit" alert>
                😎 Yes I'm sure
              </Button>
            </Article>
          </form>
        )}
      </main>
    </>
  );
}
