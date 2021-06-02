import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { css } from "emotion";

import Article from "./Article";
import Heading from "./Heading";
import Button from "./Button";
import RecoveryPhrases from "./RecoveryPhrases";
import { createRecoveryPhrase } from "../../utils/mnemonics";

export default function ({ onConfirm }) {
  const [recoveryPhrases, setRecoveryPhrases] = useState([]);

  useEffect(() => {
    // generate the wallet here
    (async () => {
      const { mnemonic } = createRecoveryPhrase();
      setRecoveryPhrases(mnemonic.split(" "));
    })();

    async () => {};
  }, []);

  async function handleStoreWallet(e) {
    e.preventDefault();
    onConfirm(recoveryPhrases.join(" "));
  }

  return (
    <form onSubmit={handleStoreWallet}>
      <Article ariaLabel="Confirm Recovery Key">
        <Heading number={3}>Backup Recovery Phrases 🔒</Heading>
        <p
          class={css`
            font-size: 14px;
            font-weight: 300;
          `}
        >
          This is your recovery phrases, please write them down on a paper and
          keep them safely. You might lose access to your wallet if you don't
          have these phrases.
        </p>

        <Heading number="4">Write these on a paper</Heading>

        <RecoveryPhrases words={recoveryPhrases} />
        <Button type="submit" primary>
          I wrote it down
        </Button>
      </Article>
    </form>
  );
}
