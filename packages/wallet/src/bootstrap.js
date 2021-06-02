import "core-js/stable";
import "regenerator-runtime/runtime";
import { h, render } from "preact";
import AppRouter from "./components/App";

render(<AppRouter />, document.querySelector("#app"));
