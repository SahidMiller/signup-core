import { h, Fragment } from "preact";
import Router from "preact-router";
import { createHashHistory } from "history";

import usePostMessage from "../hooks/usePostMessage";
import { WithIpfsAppLoader } from "../hooks/useIpfsAppLoader";

import { toast, ToastContainer } from "react-toastify";
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";
//import CID from "cids";

import Home from "./wallet/Home";
import Logout from "./wallet/Logout";

import "../css/base.css";
import "../css/ReactToastify.css";

import Register from "./wallet/Register";
import Login from "./wallet/Login";
import { useEffect } from "preact/hooks";

Sentry.init({
  dsn: "https://ed7dcd826ee742e59b9247fcb1e2a141@o466710.ingest.sentry.io/5481245",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});

function App() {
  const [clientPayload] = usePostMessage({});

  useEffect(() => {
    const [match, cid] = window.location.href.match(
      /\/ipfs\/([A-Za-z0-9]*)(?:\/|$)/
    ) || [false];

    if (match && cid) {
      //TODO God willing: forever on redirect to this page if brought up?
      //TODO God willing: Open and check if it's working via window.opener?
      toast.warn(
        "Be careful! Using this wallet /ipfs/Qm... is considered dangerous. Use a subdomain instead. Learn more!"
      );
    }
  }, []);

  return (
    <>
      <Router history={createHashHistory()}>
        <Home default path="/" clientPayload={clientPayload} />
        <Logout path="/logout" />
        <Register path="/register" />
        <Login path="/login" />
      </Router>

      <ToastContainer
        position="bottom-center"
        draggable
        className={() => "signup-toaster-container"}
      />
    </>
  );
}

export default WithIpfsAppLoader(App);
