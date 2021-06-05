import { h, Fragment } from "preact";
import Router from "preact-router";
import { createHashHistory } from "history";

import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

import "../css/base.css";

import WalletHome from "./wallet/WalletHome";
import Topup from "./wallet/Topup";
import Send from "./wallet/Send";
import SLPTokens from "./wallet/SLPTokens";
import NFTs from "./wallet/NFTs";
import TokenPage from "./wallet/TokenPage";
import Contributions from "./wallet/Contributions";
import WithUtxos from "./WithUtxos";

Sentry.init({
  dsn: "https://ed7dcd826ee742e59b9247fcb1e2a141@o466710.ingest.sentry.io/5481245",
  integrations: [new Integrations.BrowserTracing()],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
});

function AppRouter({ clientPayload }) {
  return (
    <>
      <Router history={createHashHistory()}>
        <WalletHome default path="/" clientPayload={clientPayload} />
        <Topup path="/top-up" clientPayload={clientPayload} />
        <Send path="/send" clientPayload={clientPayload} />
        <SLPTokens path="/tokens" />
        <NFTs path="/NFTs" />
        <TokenPage path="/token" />
        <Contributions path="/contributions" />
      </Router>
    </>
  );
}

const Component = WithUtxos(AppRouter);
export { Component as AppRouter };
