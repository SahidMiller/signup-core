import { h, Fragment } from "preact";
import { slide as Menu } from "react-burger-menu";
import { css } from "emotion";

const menuStyles = {
  bmBurgerButton: {
    position: "fixed",
    width: "36px",
    height: "30px",
    right: "36px",
    top: "36px",
  },
  bmBurgerBars: {
    background: "#373a47",
  },
  bmBurgerBarsHover: {
    background: "#a90000",
  },
  bmCrossButton: {
    height: "24px",
    width: "24px",
  },
  bmCross: {
    background: "#bdc3c7",
  },
  bmMenuWrap: {
    position: "fixed",
    height: "100%",
    display: "block",
  },
  bmMenu: {
    background: "#7c3aed",
    fontSize: "1.15em",
  },
  bmMorphShape: {
    fill: "#7c3aed",
  },
  bmItemList: {
    padding: "0.8em",
    boxSizing: "border-box",
  },
  bmItem: {
    display: "block",
    margin: "16px",
    color: "white",
  },
  bmOverlay: {
    background: "rgba(0, 0, 0, 0)",
  },
};

export default function () {
  return (
    <Menu styles={menuStyles} width={"200px"} right pageWrapId="body-wrap">
      <a href="/">Home</a>
      <a href="/top-up">Topup</a>
      <a href="/send">Send</a>
      <a href="/tokens">Tokens</a>
      <a href="/NFTs">NFTs</a>
      <a href="/contributions">Contributions</a>
      <a href="/backup">Backup</a>
      <a href="/logout">Logout</a>
      <span
        class={css`
          position: absolute;
          bottom: 40px;
          text-align: center;
          font-size: 13px;
        `}
      >
        Support: hello@signup.cash
      </span>
    </Menu>
  );
}
