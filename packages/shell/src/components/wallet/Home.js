import { h, Fragment } from "preact";
import { useContext, useState, useEffect } from "preact/hooks";
import { css } from "emotion";

import Authenticate from "./Authenticate";
import Identicons from '@nimiq/identicons'
import Heading from '../common/Heading'
//import Checkbox from '../common/Checkbox'
import Login from '../common/Login'
import Button from '../common/Button'

import { WalletContext } from "../WithWallet";
import { slide as Menu } from "react-burger-menu";
import menuStyles from './menuStyles'

const indexIconCss = css`
  position: fixed; 
  left: 15px; 
  top: 15px; 

  &:after {
    content: attr(data-index);
    position: absolute;
    background: #6a15fd;
    border-radius: 100%;
    padding: 0.3em;
    color: white;
    font-size: 13px;
    width: 16px;
    height: 16px;
    right: -6px;
    top: -6px;
    font-family: Poppins, sans-serif;
    line-height: 1.3;
    text-align: center;
    font-weight: bold;
  }
`

const placeholderAvatar = Identicons.placeholderToDataUrl();
import svgPath from '@nimiq/identicons/dist/identicons.min.svg'
import { storeWalletIpfsPath, storeRequestedWalletIpfsPath, findWallet } from "../../utils/wallet"

Identicons.svgPath = svgPath

export default function ({ clientPayload }) {
  //TODO God willing: strategy to meet need for security when old sigs can still be used, God willing.
  const { walletExist, bchAddr, isReady, isWalletIpfsPathLoaded, walletComponents, currentWalletIpfsIndex = 1, currentRequestedWalletIpfsPath } = useContext(WalletContext);
  const [identiconSrc, setIdenticonSrc] = useState("")
  const [allowUpgrade, setAllowUpgrade] = useState(null)
  
  //Show identicon when address is available
  useEffect(async () => {
    
    if (walletExist) {
      setIdenticonSrc(await Identicons.toDataUrl(bchAddr));
    } else {
      setIdenticonSrc(placeholderAvatar)
    }

  }, [walletExist, bchAddr])

  //Remove requested wallet path if rejected
  useEffect(async () => {
    if (allowUpgrade === false) {
      storeRequestedWalletIpfsPath(null).finally(() => {
        window.location.reload()
      })
    }
  }, [allowUpgrade])
  
  async function handleAllow(email, password) {
    if (!allowUpgrade) {
      return
    }
    
    const wif = await findWallet(email, password)

    if (!wif) {
      
      //TODO God willing: wrong password

    } else {
      
      await storeWalletIpfsPath(wif, currentRequestedWalletIpfsPath, currentWalletIpfsIndex + 1);
      await storeRequestedWalletIpfsPath(null);
      
      window.location.reload()
    }
  }

  function loadWalletHome() {
    const { WalletHome } = walletComponents
    return <WalletHome clientPayload={clientPayload} />
  }

  return (
    <>
      <header>
        {isReady && !!walletExist && (
          <div class={indexIconCss} data-index={currentWalletIpfsIndex}>
            <img src={ identiconSrc } style="width: 60px;"></img>
          </div>
        )}
            
        {walletExist && (
          <Menu
            styles={menuStyles}
            width={"200px"}
            right
            pageWrapId="body-wrap"
          >
            <a href="/">Home</a>
            {isWalletIpfsPathLoaded && [
              <a href="/top-up">Topup</a>,
              <a href="/send">Send</a>,
              <a href="/tokens">Tokens</a>,
              <a href="/NFTs">NFTs</a>,
              <a href="/contributions">Contributions</a>,
              <a href="/backup">Backup</a>
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
        )}
      </header>
      <main>
        {!isReady && (
          <div
            class={css`
              text-align: center;
              color: #7c3aed;
            `}
          >
            Opening your wallet ... 🔒
            <p
              class={css`
                font-size: 12px;
                margin: 20px;
                font-weight: 300;
                color: black;
              `}
            >
              This might take a few seconds...
            </p>
          </div>
        )}

        {isReady && !walletExist && (
          <Authenticate/>
        )}

        {isReady && !!currentRequestedWalletIpfsPath && (
          <Login onLogin={handleAllow}>
            { isDisabled => <>
              <Heading highlight number={5} customCss={css`margin:30px 20px !important;`}>
                <pre>{ currentRequestedWalletIpfsPath }</pre>
                If you did not request this update or validate the update meets your needs, then please reject this immediately!
              </Heading>
              <Button onClick={() => setAllowUpgrade(true)} type="submit" disabled={isDisabled} primary>
                Upgrade 
              </Button>
              <Button onClick={() => setAllowUpgrade(false)} type="submit" alert>
                Reject
              </Button>
            </>}
          </Login>
        )}

        {isReady && walletExist && isWalletIpfsPathLoaded && loadWalletHome()}
      </main>
    </>
  );
}
