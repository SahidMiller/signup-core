import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import { Link, route } from "preact-router";

import { css } from "emotion";

import Logo from "../common/Logo";
import Button from "../common/Button";
import Heading from "../common/Heading";
import Article from "../common/Article";
import Login from "../common/Login";

import NewWallet from "./register/NewWallet";
import ImportWallet from "./register/ImportWallet";

import passworder from "browser-passworder";

export default function () {
  const [step, setStep] = useState(1);
  const [isNewWallet, setIsNewWallet] = useState(false);
  const [key, setKey] = useState();

  async function handleLogin(email, password) {
    setKey(await passworder.keyFromPassword(password, btoa(email)));
    setStep(2);
  }

  function goBack(event) {
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    }

    event.preventDefault();

    if (step === 2) {
      setStep(1);
    } else {
      route("/");
    }
  }

  return (
    <>
      {step === 1 && (
        <Article ariaLabel="Create or import a new wallet">
          <Logo slp />

          <Login onLogin={handleLogin} showHints={true}>
            {(isDisabled) => (
              <>
                <Heading
                  highlight
                  number={5}
                  customCss={css`
                    margin: 30px 20px !important;
                  `}
                >
                  Email and password is used for local encryption <u>only</u>
                </Heading>
                <Button
                  onClick={() => setIsNewWallet(true)}
                  type="submit"
                  disabled={isDisabled}
                  primary
                >
                  Create a new wallet
                </Button>
                <Button
                  onClick={() => setIsNewWallet(false)}
                  type="submit"
                  disabled={isDisabled}
                  secondary
                >
                  Import an existing wallet
                </Button>
              </>
            )}
          </Login>
        </Article>
      )}

      {step === 2 && isNewWallet && <NewWallet encryptionKey={key} />}

      {step === 2 && !isNewWallet && <ImportWallet encryptionKey={key} />}

      <footer style="margin-top:20px">
        <Link
          href={step === 1 ? "/" : "/register"}
          onClick={goBack}
        >{`< Back`}</Link>
      </footer>
    </>
  );
}
