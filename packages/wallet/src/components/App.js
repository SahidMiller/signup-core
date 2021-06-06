import { h, Fragment } from "preact";
import { ToastContainer } from "react-toastify";

import { AppRouter } from "./AppRouter";
import Menu from "./wallet/Menu";

import "../css/base.css";
import "../css/ReactToastify.css";
import usePostMessage from "../hooks/usePostMessage";

export default function App() {
  const [clientPayload] = usePostMessage({});

  return (
    <>
      <header>
        <Menu />
      </header>
      <AppRouter clientPayload={clientPayload} />
      <ToastContainer
        position="bottom-center"
        draggable
        className={() => "signup-toaster-container"}
      />
    </>
  );
}
