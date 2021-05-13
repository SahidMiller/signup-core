import { h, Fragment } from "preact";
import { css, cx } from "emotion";

export default function ({ onClick, customStyle }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="#7c3aed"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      onClick={onClick}
      class={cx(
        css`
          cursor: pointer;
        `,
        customStyle
      )}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  );
}
