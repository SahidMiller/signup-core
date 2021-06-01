import { h, Fragment } from "preact";
import { useState, useEffect, useContext, useReducer } from "preact/hooks";
import { css } from "emotion";
import QRCode from "qrcode.react";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/browser";
import {
  handleMessageBackToClient,
  workerCourier,
  onWorkerEvent,
} from "../../signer";
import { makeAccessToken, makeSessionId } from "../../utils/permission";
import { getWalletAddr, getWalletCashAccount } from "../../utils/wallet";
import Heading from "signup-app/Heading";
import Input from "signup-app/Input";
import Button from "signup-app/Button";
import Checkbox from "signup-app/Checkbox";
import Loading from "signup-app/Loading";
import Article from "signup-app/Article";
import { UtxosContext } from "../WithUtxos";
import { genesisNftChild, feesFor } from "../../utils/transactions";
import slpLogo from "../../assets/slp-logo-2.png";
import bchLogo from "../../assets/bch-icon-qrcode.png";
import { getSlpByTokenId } from "../../utils/slp";
import { satsToBch } from "../../utils/unitUtils";
import { tiny, formatDocumentUri } from "../../utils/helpers";
import { SLP_EXPLORER } from "../../config";

const Row = ({ children }) => (
  <div
    class={css`
      display: flex;
      flex-direction: row;
    `}
  >
    {children}
  </div>
);

export default function ({ clientPayload }) {
  // TODO move it to higher level using context
  const [status, setStatus] = useState("PENDING");
  const [tokenName, setTokenName] = useState();
  const {
    slpUtxos,
    slpBalances,
    latestSatoshisBalance,
    latestUtxos,
    utxoIsFetching,
    refetchUtxos,
    slpAddr,
    bchAddr,
  } = useContext(UtxosContext);

  useEffect(() => {
    if (utxoIsFetching) return;
    const { type, groupId } = clientPayload.action;

    // TODO: if action is minting nft children, the nft group minting baton should exist

    // check if there is enough BCH for the fees
    if (latestSatoshisBalance < feesFor(3, 4)) {
      // Not enough BCH to pay for fees
      setStatus("NOT_ENOUGH_BCH");
    } else {
      setStatus("WAITING");
    }

    (async () => {
      // if it's minting nft child, fetch the metadata of the group
      if (type !== "MINT_SLP_CHILD" || !groupToken) return;

      const token = await getSlpByTokenId(groupId);
      setGroupToken(token);
    })();
  }, [latestSatoshisBalance]);

  useEffect(() => {
    setStatus("PENDING");
  }, [clientPayload.nonce]);

  useEffect(() => {
    if (utxoIsFetching) return;
    setStatus("WAITING");
  }, [utxoIsFetching]);

  function handleAllow(e) {
    setStatus("PROCESSING");
    e.preventDefault();
    (async () => {
      const {
        ticker,
        name,
        groupId,
        imageUri,
        imageHash,
        receiverSlpAddr,
      } = clientPayload.action;

      // peform the transaction
      try {
        const { txId } = await genesisNftChild(
          name,
          ticker,
          imageUri,
          imageHash,
          groupId,
          bchAddr,
          receiverSlpAddr,
          latestSatoshisBalance,
          latestUtxos,
          slpBalances,
          slpUtxos
        );

        handleMessageBackToClient("GRANTED", clientPayload.reqId, {
          txResult: { txId },
          action: clientPayload.action,
        });
        self.close();
      } catch (e) {
        console.log(e);
        Sentry.captureException(e);

        toast.error(e.message);
      }
    })();
  }

  function handleDeny() {
    handleMessageBackToClient("DENIED", clientPayload.reqId);
    self.close();
  }

  return (
    <>
      {utxoIsFetching && <Loading text="Opening your wallet ... 🔒" />}

      {status === "PROCESSING" && (
        <Loading text="Processing your transaction ..." />
      )}

      {status === "WAITING" && !utxoIsFetching && (
        <form onSubmit={handleAllow}>
          <Heading number={3}>NFT Child Genesis Request</Heading>
          <p
            class={css`
              font-size: 14px;
              margin: 16px;
            `}
          >
            Please confirm if you agree with this transaction:
          </p>

          <Row>
            <Heading number={4} inline>
              Type:
            </Heading>
            <Heading
              number={4}
              inline
              customCss={css`
                color: black;
                margin: 8px 0;
              `}
            >
              Genesis NFT Child
            </Heading>
          </Row>

          <Row>
            <Heading number={4} inline>
              Name:
            </Heading>
            <Heading
              number={4}
              inline
              customCss={css`
                color: black;
                margin: 8px 0;
              `}
            >
              {clientPayload.action.name}
            </Heading>
          </Row>

          <Row>
            <Heading number={4} inline>
              Image URI:
            </Heading>
            <Heading
              number={5}
              inline
              customCss={css`
                color: black;
                margin: 8px 0;
              `}
            >
              {formatDocumentUri(clientPayload.action.imageUri)}
            </Heading>
          </Row>

          <Row>
            <Heading number={4} inline>
              Request From:
            </Heading>
            <Heading
              number={4}
              inline
              customCss={css`
                color: black;
                margin: 8px 0;
              `}
            >
              {clientPayload.origin}
            </Heading>
          </Row>

          <Button type="submit" primary>
            Allow
          </Button>
          <Button onClick={handleDeny} type="button" secondary>
            Deny
          </Button>
        </form>
      )}

      {status === "NOT_ENOUGH_BCH" && !utxoIsFetching && (
        <>
          <Heading number={2}>Not Enough BCH</Heading>
          <Heading number={5}>
            You need to have at least {satsToBch(feesFor(4, 4))} BCH to pay for
            the fees on this transaction. If you want to proceed, send enough
            BCH to this address:
          </Heading>
          <QRCode
            value={bchAddr}
            renderAs={"png"}
            size={250}
            includeMargin
            imageSettings={{
              src: bchAddr && bchLogo,
              x: null,
              y: null,
              height: 50,
              width: 50,
              excavate: false,
            }}
          />
          <Heading
            size="12px"
            ariaLabel="Your BCH Address"
            number={5}
            highlight
          >
            {bchAddr}
          </Heading>
          <p>Click on the button below after you sent the required amount:</p>
          <Button onClick={() => refetchUtxos()}>Check Again</Button>
          <Button alert onClick={handleDeny}>
            Cancel
          </Button>
        </>
      )}

      {status === "NOT_ENOUGH_SLP" && !utxoIsFetching && (
        <>
          <Heading number={2}>Not Enough SLP</Heading>
          <Heading number={5}>
            You need to have {clientPayload.action.amount} {tokenName} to
            complete this transaction. If you want to proceed, send enough{" "}
            {tokenName} to this address:
          </Heading>
          <QRCode
            value={slpAddr}
            renderAs={"png"}
            size={250}
            includeMargin
            imageSettings={{
              src: slpAddr && slpLogo,
              x: null,
              y: null,
              height: 50,
              width: 50,
              excavate: false,
            }}
          />
          <Heading
            size="12px"
            ariaLabel="Your SLP Address"
            number={5}
            highlight
          >
            {slpAddr}
          </Heading>
          <p>Click on the button below after you sent the required amount:</p>
          <Button onClick={() => refetchUtxos()}>Check Again</Button>
          <Button alert onClick={handleDeny}>
            Cancel
          </Button>
        </>
      )}
    </>
  );
}
