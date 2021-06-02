import { h, Fragment } from "preact";
import Router from "preact-router";

import usePostMessage from "../hooks/usePostMessage";
import useIpfsAppLoader from "../hooks/useIpfsAppLoader";
import { WithWallet } from "../hooks/useWallet";

import { ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

import Home from "./wallet/Home";
import Logout from "./wallet/Logout";

import "../css/base.css";

import Register from "./wallet/Register";
import Login from "./wallet/Login";

Sentry.init({
  dsn: "https://ed7dcd826ee742e59b9247fcb1e2a141@o466710.ingest.sentry.io/5481245",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});

function App() {
  const { isIpfsPathLoaded, walletComponents } = useIpfsAppLoader();
  const [clientPayload] = usePostMessage({});

  function loadWalletComponents() {
    if (!isIpfsPathLoaded) return;

    const { Topup, Send, Backup, SLPTokens, NFTs, TokenPage, Contributions } =
      walletComponents;

    return [
      <Topup path="/top-up" clientPayload={clientPayload} />,
      <Send path="/send" clientPayload={clientPayload} />,
      <Backup path="/backup" />,
      <SLPTokens path="/tokens" />,
      <NFTs path="/NFTs" />,
      <TokenPage path="/token" />,
      <Contributions path="/contributions" />,
    ];
  }

  return (
    <>
      <Router>
        <Home path="/" clientPayload={clientPayload} />
        <Logout path="/logout" />
        <Register path="/register" />
        <Login path="/login" />
        {loadWalletComponents()}
      </Router>

      <ToastContainer position="bottom-center" draggable />
    </>
  );
}

export default WithWallet(App);
