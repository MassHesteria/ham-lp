/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { getHostName } from "./frames";
import { AllowedFrameButtonItems, FramesHandlerFunctionReturnType, JsonValue } from "frames.js/types";

const serializeToBase64 = (json: any) => {
  const jsonString = JSON.stringify(json);
  return Buffer.from(jsonString).toString('base64');
};

export const deserializeFromBase64 = (base64: string) => {
  const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(jsonString);
};

export const getShareLink = (encoded: string|null) => {
  let baseRoute = getHostName();
  if (encoded != null) {
    baseRoute += `/share/${encoded}`
    //console.log(baseRoute)
  }
  const shareLink =
    `https://warpcast.com/~/compose?text=${encodeURIComponent("View Ham LPs in a Frame!")}` +
    "&embeds[]=" + encodeURIComponent(baseRoute);
  return shareLink
}

export const getPage = (
  username: string,
  fid: number,
  tokens: number[],
  idx: string | undefined
): FramesHandlerFunctionReturnType<JsonValue|undefined> => {
  let imagePath = getHostName() + `/page?u=${encodeURIComponent(username)}&v=3`;
  const buttons: AllowedFrameButtonItems[] = [
    <Button action="post">Mine/🔎</Button>,
  ];

  let num = 0;
  if (idx !== undefined) {
    num = parseInt(idx) % tokens.length;
  }
  imagePath += `&a=${tokens[num]}`;

  if (num + 1 < tokens.length) {
    imagePath += `&b=${tokens[num + 1]}`;
  }

  if (tokens.length > 2) {
    const next = num + 1 < tokens.length ? (num + 2) % tokens.length : 0;
    buttons.push(
      <Button action="post" target={`/?fid=${fid}&idx=${next}`}>
        Next ⏭
      </Button>
    );
  }

  const args = {
    n: username,
    f: fid,
    t: tokens,
    i: num,
    s: Date.now()
  }
  buttons.push(
    <Button action="link" target={getShareLink(serializeToBase64(args))}>
      Share
    </Button>
  );

  return {
    image: imagePath,
    imageOptions: {
      aspectRatio: "1.91:1",
    },
    textInput: " Search by username",
    buttons,
  };
};