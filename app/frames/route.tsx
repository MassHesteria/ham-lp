/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import {
  frames,
  getHostName,
  getHubRoute,
} from "../frames";
import { extractAddressFromJSONMessage, getUserDataForFid } from "frames.js";
import { AllowedFrameButtonItems } from "frames.js/types";

type UserData = {
  fid: number;
  name: string;
  addresses: string[];
}

const getShareLink = (fid: number|null) => {
  let baseRoute = getHostName() + `?ts=${Date.now()}`;
  if (fid != null) {
    baseRoute += `&fid=${fid}`
  }
  const shareLink =
    "https://warpcast.com/~/compose?text=View Ham LPs in a Frame!" +
    "&embeds[]=" + encodeURIComponent(baseRoute);
  return shareLink
}

const getDataFromFID = async (fid: number): Promise<UserData|null> => {
  const userData = await getUserDataForFid({ fid })
  //console.log(userData)
  if (userData?.username !== undefined) {
    const res = await fetch(getHubRoute() + `/v1/verificationsByFid?fid=${fid}`)
    if (res) {
      const json = await res.clone().json()
      return {
        fid,
        name: userData.username,
        addresses: json.messages.map(extractAddressFromJSONMessage).filter((p: any) => p != null)
      }
    }
  }
  return null
}

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`;
  const baseRoute = getHostName() + "/frames?ts=" + timestamp;
  const message = ctx?.message
  let data: UserData|null = null

  if (ctx.searchParams?.fid) {
    data = await getDataFromFID(ctx.searchParams.fid)
  } else if (message !== undefined) {
    if (message.inputText) {
      const fid = parseInt(message.inputText)
      if (!Number.isNaN(fid)) {
        data = await getDataFromFID(fid)
      }
    } else {
      data = {
        fid: message.requesterFid,
        name: message.requesterUserData.username,
        addresses: message.requesterVerifiedAddresses
      }
    }
  }

  if (data === null) {
    return {
      image: (
        <div
          tw="flex flex-col w-full h-full justify-center items-center"
          style={{ backgroundColor: "#282a36" }}
        >
          <div tw="flex">
            <span tw="text-7xl" style={{ color: "#f8f8f2" }}>
              View Ham LPs by Owner
            </span>
          </div>
          <div tw="flex">
            <span style={{ color: "#ffb86c" }}>by @masshesteria</span>
          </div>
        </div>
      ),
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      textInput: " Search by FID",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ],
    };
  }

  const addresses = data.addresses

  const tokens: number[] = []
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i]
    const res = await fetch(getHostName() + `/instances?a=${addr}`)
    if (res === undefined) {
      continue;
    }
    const data = await res.json()
    data.tokens.forEach((t: number) => {
      tokens.push(t)
    })
  }

  if (tokens.length <= 0) {
    return {
      image: (
        <div
          tw="flex flex-col w-full h-full justify-center items-center"
          style={{ backgroundColor: "#282a36" }}
        >
          <div tw="flex">
            <span tw="text-8xl" style={{ color: "#ff79c6" }}>
              No Ham LPs Found
            </span>
          </div>
          <div tw="flex">
            <span tw="text-8xl" style={{ color: "#ffb86c" }}>
              @{data.name}
            </span>
          </div>
        </div>
      ),
      imageOptions: {
        aspectRatio: '1.91:1'
      },
      textInput: " Search by FID",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ]
    }
  }

  let username = data.name
  let imagePath = getHostName() + `/page?ts=${timestamp}&u=${encodeURIComponent(username)}`
  const buttons: AllowedFrameButtonItems[] = [
    <Button action="post" target = {baseRoute}>Mine/🔎</Button>,
  ]

  const idx = ctx.searchParams?.idx
  let num = 0
  if (idx !== undefined) {
    num = parseInt(idx) % tokens.length
  }
  imagePath += `&a=${tokens[num]}`

  if (num + 1 < tokens.length) {
    imagePath += `&b=${tokens[num+1]}`
  }

  if (tokens.length > 2) {
    const next = num + 1 < tokens.length ? (num + 2) % tokens.length : 0
    buttons.push(
      <Button action="post" target={baseRoute + `&fid=${data.fid}&idx=${next}`}>Next ⏭</Button>,
    )
  }

  buttons.push(
    <Button action="link" target = {getShareLink(data.fid)}>Share</Button>
  )

  return {
    image: imagePath,
    imageOptions: {
      aspectRatio: "1.91:1"
    },
    textInput: " Search by FID",
    buttons
  }
})

export const GET = handleRequest;
export const POST = handleRequest;