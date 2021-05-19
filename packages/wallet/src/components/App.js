import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import Router from "preact-router";
import { ToastContainer, toast } from "react-toastify";
import { css } from "emotion";
import { get, set } from "idb-keyval"

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";
import {
  handleMessageBackToClient,
  initWorker,
  workerCourier,
} from "../signer";
import NewWallet from "./new-wallet/NewWallet";
import Topup from "./wallet/Topup";
import Send from "./wallet/Send";
import Backup from "./wallet/Backup";
import Logout from "./wallet/Logout";
import ImportWallet from "./wallet/ImportWallet";
import SLPTokens from "./wallet/SLPTokens";
import NFTs from "./wallet/NFTs";
import TokenPage from "./wallet/TokenPage";
import Contributions from "./wallet/Contributions";

import Home from "./home/Home";
import WithUtxos from "./WithUtxos";

import { SIGNUP_LAST_USED_IPFS_PATH, SIGNUP_LATEST_AVAILABLE_IPFS_PATH, SIGNUP_USED_IPFS_PATHS } from '../config.js'

import "../css/base.css";

Sentry.init({
  dsn:
    "https://ed7dcd826ee742e59b9247fcb1e2a141@o466710.ingest.sentry.io/5481245",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});

function App() {
  const [clientPayload, setClientPayload] = useState({});
  const [availableUpdate, setAvailableUpdate] = useState(false)  
  const [currentIpfsPath, setCurrentIpfsPath] = useState(null)

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

    if (window) {
      window.addEventListener("message", receiveMessage, false);
      // send a message back to confirm this is ready
      handleMessageBackToClient("READY", null);
    }

    initWorker();
  }, []);

  useEffect(() => {
    if (clientPayload && clientPayload.origin) {
      // update the origin in the worker
      // TODO: This need to be refactored later to allow usage with multiple origins
      workerCourier("current_origin", { origin: clientPayload.origin });
    }
  }, [clientPayload]);

  useEffect(async () => {

    if (process.env.NODE_ENV !== "development" || Boolean(process.env.FORCE_IPFS)) {
      
      const currentIpfsPath = await get(SIGNUP_LAST_USED_IPFS_PATH)
      const latestAvailableSignupIpfsPath = await get(SIGNUP_LATEST_AVAILABLE_IPFS_PATH)

      if (currentIpfsPath !== latestAvailableSignupIpfsPath) {
        setAvailableUpdate(latestAvailableSignupIpfsPath)
      }

      setCurrentIpfsPath(currentIpfsPath)
    }
  })

  useEffect(async () => {
    if (availableUpdate) {
      toast.info("Update available!", {
        onClick: async () => {
          
          const walletHashHistory = Array.from(
            new Set([
              ...(await get(SIGNUP_USED_IPFS_PATHS) || []),
              currentIpfsPath
            ])
          )
          
          await set(SIGNUP_LAST_USED_IPFS_PATH, availableUpdate)
          await set(SIGNUP_USED_IPFS_PATHS, walletHashHistory)
          
          window.location.reload()
        }
      })
    }
  }, [availableUpdate])

  return (
    <>
      <Router>
        <Home path="/" clientPayload={clientPayload} />
        <NewWallet path="/new-wallet" clientPayload={clientPayload} />
        <Topup path="/top-up" clientPayload={clientPayload} />
        <Send path="/send" clientPayload={clientPayload} />
        <Backup path="/backup" />
        <Logout path="/logout" />
        <ImportWallet path="/import" />
        <SLPTokens path="/tokens" />
        <NFTs path="/NFTs" />
        <TokenPage path="/token" />
        <Contributions path="/contributions" />
      </Router>

      <ToastContainer position="bottom-center" draggable />
    </>
  );
}

export default WithUtxos(App);
