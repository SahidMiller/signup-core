import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { css } from "emotion";

import Identicons from "@nimiq/identicons";

const indexIconCss = css`
  position: fixed;
  left: 15px;
  top: 15px;

  &:after {
    content: attr(data-index);
    position: absolute;
    background: #6a15fd;
    border-radius: 100%;
    padding: 0.3em;
    color: white;
    font-size: 13px;
    width: 16px;
    height: 16px;
    right: -6px;
    top: -6px;
    font-family: Poppins, sans-serif;
    line-height: 1.3;
    text-align: center;
    font-weight: bold;
  }
`;

import svgPath from "@nimiq/identicons/dist/identicons.min.svg";
Identicons.svgPath = svgPath;

const placeholderAvatar = Identicons.placeholderToDataUrl();

export default function ({ index, uniqueId }) {
  const [identiconSrc, setIdenticonSrc] = useState("");

  //Show identicon when address is available
  useEffect(async () => {
    if (uniqueId) {
      setIdenticonSrc(await Identicons.toDataUrl(uniqueId));
    } else {
      setIdenticonSrc(placeholderAvatar);
    }
  }, [uniqueId]);

  return (
    <div class={indexIconCss} data-index={index}>
      <img src={identiconSrc} style="width: 60px;"></img>
    </div>
  );
}
