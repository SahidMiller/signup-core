import { h, Fragment } from "preact";
import { css, cx } from "emotion";
import Input from "./Input";

const inputInfo = css`
  position: relative;

  &:after {
    position: absolute;
    display: block;
    content: "";
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid hsl(255deg 75% 94%);
    bottom: 0;
    left: 10px;
  }
`;

const inputContainer = css`
  background: hsl(255deg 75% 94%);
`;

export default function (props) {
  return (
    <div class={inputContainer}>
      <div class={props.children && inputInfo}>
        <Input {...props} />
      </div>
      {props.children}
    </div>
  );
}
