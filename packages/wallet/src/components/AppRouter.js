import { h, Fragment } from "preact";
import Router from "preact-router";
import { createHashHistory } from "history";

import WalletHome from "./wallet/WalletHome";
import Topup from "./wallet/Topup";
import Send from "./wallet/Send";
import SLPTokens from "./wallet/SLPTokens";
import NFTs from "./wallet/NFTs";
import TokenPage from "./wallet/TokenPage";
import Contributions from "./wallet/Contributions";
import WithUtxos from "./WithUtxos";

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
