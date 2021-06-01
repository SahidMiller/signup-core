import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import Router from "preact-router";
import { Link, route } from "preact-router";

import { css } from "emotion";

import Logo from "../common/Logo";
import Button from "../common/Button";
import Heading from "../common/Heading";
import Article from "../common/Article";
import Login from "../common/Login";

import NewWallet from "./register/NewWallet";
import ImportWallet from "./register/ImportWallet";

import passworder from "browser-passworder"

export default function () {
  const [step, setStep] = useState(1)
  const [isNewWallet, setIsNewWallet] = useState(false)
  const [key, setKey] = useState()
  
  async function handleLogin(email, password) {
    setKey(await passworder.keyFromPassword(password, btoa(email)))
    setStep(2)
  }

  return (
    <>
      <Article ariaLabel="Create or import a new wallet">
        <Logo slp />
        { step === 1 && <Login onLogin={handleLogin} showHints={true}>
          { isDisabled => <>
            <Heading highlight number={5} customCss={css`margin:30px 20px !important;`}>
              Email and password is used for local encryption <u>only</u>
            </Heading>
            <Button onClick={() => setIsNewWallet(true)} type="submit" disabled={isDisabled} primary>
              Create a new wallet
            </Button>
            <Button onClick={() => setIsNewWallet(false)} type="submit" disabled={isDisabled} secondary>
              Import an existing wallet
            </Button>
          </>}
        </Login> }

        { step === 2 && isNewWallet && (
          <NewWallet encryptionKey={key} />
        )}

        { step === 2 && !isNewWallet && (
          <ImportWallet encryptionKey={key} />
        )}

      </Article>
      <footer style="margin-top:20px">
        <Link href="/">{`< Back`}</Link>
      </footer>
    </>
  );
}
