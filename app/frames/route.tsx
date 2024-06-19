/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames, getHostName } from "../frames";
import { getPage, getShareLink } from "../generate";

type UserData = {
  fid: number;
  name: string;
  addresses: string[];
}

const getDataFromFID = async (fid: number): Promise<UserData|null> => {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  const users = json.users

  if (users && users.length > 0) {
    //console.log(users[0].verified_addresses.eth_addresses)
    return {
      fid: users[0].fid,
      name: users[0].username,
      addresses: users[0].verified_addresses.eth_addresses
    }
  }

  return null
}

const getDataFromName = async (name: string): Promise<UserData|null> => {
  const url = `https://api.neynar.com/v2/farcaster/user/search?q=${name}&viewer_fid=3&limit=1`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  const users = json.result.users

  if (users && users.length > 0) {
    //console.log(users[0].verified_addresses.eth_addresses)
    return {
      fid: users[0].fid,
      name: users[0].username,
      addresses: users[0].verified_addresses.eth_addresses
    }
  }

  return null
}

const handleRequest = frames(async (ctx: any) => {
  const baseRoute = getHostName() + "/frames";
  const message = ctx?.message
  let data: UserData|null = null

  //console.log(message)

  if (ctx.searchParams?.fid) {
    data = await getDataFromFID(ctx.searchParams.fid)
  } else if (message !== undefined) {
    if (message.inputText) {
      const text: string = message.inputText
      data = await getDataFromName(text.replace('@', ''))
    } else if (message.requesterUserData !== undefined) {
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
      textInput: " Search by username",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ],
    };
  }

  const addresses = data.addresses
  //console.log(addresses)

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
      textInput: " Search by username",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ]
    }
  }

  return getPage(data.name, data.fid, tokens, ctx.searchParams?.idx)
})

export const GET = handleRequest;
export const POST = handleRequest;