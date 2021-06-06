import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

export default function usePostMessage() {
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
          "contribution",
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

  return [clientPayload, setClientPayload];
}
