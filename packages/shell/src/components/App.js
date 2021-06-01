import { h, Fragment } from "preact";
import { lazy, Suspense } from "preact/compat"
import { useContext, useState, useEffect } from "preact/hooks"
import Router from "preact-router";

import { ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

import Home from "./wallet/Home";
import Logout from "./wallet/Logout";

import "../css/base.css";

import WithWallet, { WalletContext } from './WithWallet'
import Register from "./wallet/Register";
import Login from "./wallet/Login";

Sentry.init({
  dsn:
    "https://ed7dcd826ee742e59b9247fcb1e2a141@o466710.ingest.sentry.io/5481245",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});


function App() {
  const { isWalletIpfsPathLoaded, walletComponents } = useContext(WalletContext)

  const [clientPayload, setClientPayload] = useState({});
  let nonce = 0;

  useEffect(() => {
    function receiveMessage(event) {
      if (
        ![
          "access",
          "spend_token",
          "send_slp",
          "genesis_slp",
          "genesis_nft_child", 
          "contribution"
        ].includes(event.data.reqType)
      ) {
        return;
      }

      console.log("[SIGNUP] event received", event.data);
      nonce++;
      const requestOrigin = event.origin.replace(/https?:\/\//, "");
      const { reqType, reqId, config, budget, deadline } = event.data;

      setClientPayload({ ...event.data, origin: requestOrigin, nonce });
    }
    
    function handleMessageBackToClient(status, reqId, meta = {}) {
      if (!window.opener) return;
      window.opener.postMessage({ status, reqId, ...meta }, "*");
    }

    if (window) {
      window.addEventListener("message", receiveMessage, false);
      // send a message back to confirm this is ready
      handleMessageBackToClient("READY", null);
    }
  }, []);

  function loadWalletComponents() {
    if (!isWalletIpfsPathLoaded) return
    const { 
      WalletHome,
      Topup, 
      Send,
      Backup,
      SLPTokens, 
      NFTs, 
      TokenPage, 
      Contributions, 
    } = walletComponents
    return [
      <Topup path="/top-up" clientPayload={clientPayload} />,
      <Send path="/send" clientPayload={clientPayload} />,
      <Backup path="/backup" />,
      <SLPTokens path="/tokens" />,
      <NFTs path="/NFTs" />,
      <TokenPage path="/token" />,
      <Contributions path="/contributions" />,
    ]
  }
  
  return (
    <>
      <Router>
          <Home path="/" clientPayload={clientPayload} />
          <Logout path="/logout" />
          <Register path="/register"/>
          <Login path="/login"/>
          { loadWalletComponents() }
      </Router>

      <ToastContainer position="bottom-center" draggable />
    </>
  );
}

export default WithWallet(App);