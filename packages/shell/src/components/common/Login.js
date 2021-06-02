import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { css } from "emotion";

import Article from "./Article";
import Heading from "./Heading";
import Input from "./Input";
import Button from "./Button";
import Checkbox from "./Checkbox";
import HintInput from "./HintInput";

const labelStyle = css`
  align-self: start;
  margin-bottom: -14px;
  margin-left: 8px;
`;
const Label = ({ children }) => <label class={labelStyle}>{children}</label>;

const invalidCss = css`
  border-color: red !important;
`;
export default function ({ onLogin, children, showHints = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordInvalid, setPasswordInvalid] = useState(true);
  const [emailInvalid, setEmailInvalid] = useState(true);
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [hidePassword, setHidePassword] = useState(false);

  function handleLoginOrRegister(e) {
    e.preventDefault();

    onLogin(email, password, e);
  }

  return (
    <>
      <form onSubmit={handleLoginOrRegister} style="min-width:340px">
        <Label>Email</Label>
        <Input
          type="email"
          customCss={emailInvalid && emailBlurred ? invalidCss : css``}
          onInput={(e) => {
            setEmailInvalid(!e.target.checkValidity());
            setEmail(e.target.value);
          }}
          onBlur={() => {
            setEmailBlurred(true);
          }}
        ></Input>
        <Label>Password</Label>
        <HintInput
          type={hidePassword ? "password" : "text"}
          customCss={passwordInvalid && passwordBlurred ? invalidCss : css``}
          autocomplete="off"
          onInput={(e) => {
            e.preventDefault();
            setPasswordInvalid(!e.target.checkValidity());
            setPassword(e.target.value);
          }}
          onBlur={(e) => {
            e.preventDefault();
            setPasswordBlurred(true);
          }}
          pattern=".{12,}"
          required
          title="5 to 10 characters"
        >
          {showHints && (
            <p style="padding: 0px 20px 10px;">12 characters minimum</p>
          )}
        </HintInput>
        {/* <Checkbox checked={hidePassword} onClick={(e) => {
              e.preventDefault();
              setHidePassword(!hidePassword)
            }}>Hide password</Checkbox> */}
        {children(emailInvalid || passwordInvalid)}
      </form>
    </>
  );
}
