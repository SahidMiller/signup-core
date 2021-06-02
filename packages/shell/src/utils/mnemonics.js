const BITBOX = require("bitbox-sdk").BITBOX;
const bitbox = new BITBOX();

export function createRecoveryPhrase() {
  const mnemonic = bitbox.Mnemonic.generate(128);
  return { mnemonic };
}

export function isRecoveryKeyValid(mnemonic) {
  return (
    bitbox.Mnemonic.validate(mnemonic, bitbox.Mnemonic.wordLists().english) ===
    "Valid mnemonic"
  );
}
