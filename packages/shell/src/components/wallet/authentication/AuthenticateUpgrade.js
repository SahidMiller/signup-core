import { h, Fragment } from "preact";
import { css } from "emotion";

import Heading from "../../common/Heading";
import Login from "../../common/Login";
import Button from "../../common/Button";
import useUpgradeIpfsPath from "../../../hooks/useUpgradeIpfsPath";

export default function () {
  const [setAllowUpgrade, requestedUpgradePath, onAuthenticated] =
    useUpgradeIpfsPath();

  return (
    <>
      <Login onLogin={onAuthenticated}>
        {(isDisabled) => (
          <>
            <Heading
              highlight
              number={5}
              customCss={css`
                margin: 30px 20px !important;
              `}
            >
              <pre>{requestedUpgradePath}</pre>
              If you did not request this update or validate the update meets
              your needs, then please reject this immediately!
            </Heading>
            <Button
              onClick={() => setAllowUpgrade(true)}
              type="submit"
              disabled={isDisabled}
              primary
            >
              Upgrade
            </Button>
            <Button onClick={() => setAllowUpgrade(false)} type="submit" alert>
              Reject
            </Button>
          </>
        )}
      </Login>
    </>
  );
}
