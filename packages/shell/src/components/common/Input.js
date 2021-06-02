import { h, Fragment } from "preact";
import { css, cx } from "emotion";

export default function ({
  type,
  onInput,
  onChange,
  onkeydown,
  onBlur,
  value,
  width,
  small,
  placeholder,
  customCss,
  pattern,
  required,
  autocomplete,
  title,
}) {
  const inputStyle = css`
    color: #7c3aed;
    width: ${width || "100%"};
    font-family: Poppins, sans-serif;
    padding: ${small ? "5px" : "0.9rem 1.2rem"};
    line-height: 1.5rem;
    margin: 16px 0px;
    height: ${small ? "30px" : "45px"};
    box-sizing: border-box;
    text-align: left;
    display: block;
    border: 2px solid #7c3aed;
    box-shadow: none;
    font-size: 16px;
    font-weight: 400;
    border-radius: 0.12rem;
    transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    &:hover {
      background: #f7e9ff;
    }
  `;

  return (
    <input
      class={cx(inputStyle, customCss)}
      type={type}
      autocomplete={autocomplete}
      value={value}
      onInput={onInput}
      onChange={onChange}
      onBlur={onBlur}
      onkeydown={onkeydown}
      pattern={pattern}
      placeholder={placeholder}
      required={required}
      title={title}
    />
  );
}