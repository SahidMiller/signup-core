import useIpfsAppLoader from "./useIpfsAppLoader";

import {
  deleteWallet,
  doesWalletExist,
  storeWalletInfo,
} from "../utils/wallet";
import { deleteIpfsPaths, storeIpfsPath } from "../utils/ipfs";
import { BITCOIN_NETWORK } from "../config";

import { BITBOX } from "bitbox-sdk";
import { storeEncryptedWif } from "../utils/wallets";
import { isRecoveryKeyValid } from "../utils/mnemonics";

const bitbox = new BITBOX({});

export default function useCreateSignupAccount() {
  const { latestIpfsPath } = useIpfsAppLoader();

  const createAccount = async (encryptionKey, mnemonic) => {
    //TODO God willing: validate ipfs path
    if (!latestIpfsPath) return;

    if (!mnemonic || !isRecoveryKeyValid(mnemonic)) {
      toast.error(
        "Your recovery phrases are not valid. Send us an email to hello@signup.cash for assistant if you need."
      );
      return;
    }

    // second check to make sure really no wallet exist here!
    // TODO God willing: if one is setup but no ipfs path (so login showed up), then allow input if they login and sign, God willing.
    // Also, God willing: if a wallet exists, then especially, God willing, allow logouts in app shell.
    const walletExist = await doesWalletExist();
    if (walletExist) {
      toast.error("A wallet already exist! You need to logout first.");
      return;
    }

    // second check to make sure really no wallet exist here!
    // TODO God willing: if one is setup but no ipfs path (so login showed up), then allow input if they login and sign, God willing.
    // Also, God willing: if a wallet exists, then especially, God willing, allow logouts in app shell.
    const seedBuffer = bitbox.Mnemonic.toSeed(mnemonic);
    const hdNode = bitbox.HDNode.fromSeed(seedBuffer, BITCOIN_NETWORK);
    const wif = hdNode.keyPair.toWIF();

    try {
      await storeWalletInfo(hdNode);
      await storeIpfsPath(wif, latestIpfsPath, 1);
      await storeEncryptedWif(encryptionKey, wif);

      //TODO God willing: Better transition?
      if (window) window.location.href = "/";
    } catch (err) {
      await deleteWallet();
      await deleteIpfsPaths();
    }
  };

  return [createAccount, !latestIpfsPath];
}
