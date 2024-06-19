import { getHostName } from "./frames";
import { getShareLink } from "./generate";

export async function generateMetadata() {
  const postUrl = getHostName() + '/frames'
  const imageUrl = getHostName() + '/intro'
  return {
    title: "Ham LP Viewer",
    description: "View your Ham LPs in a frame",
    metadataBase: new URL(getHostName()),
    openGraph: {
      title: "Ham LP Viewer",
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": postUrl,
      "fc:frame:input:text": " Search by username",
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": "Mine/🔎",
      "fc:frame:button:1:action": "post",
      "fc:frame:button:1:target": postUrl,
      "fc:frame:button:2": "POST",
      "fc:frame:button:2:action": "link",
      "fc:frame:button:2:target": getShareLink(null),
      /*"hey:portal": "vLatest",
      "hey:portal:image": imageUrl,
      "hey:portal:post_url": postUrl,
      "hey:portal:button:1": "SHARE",
      "hey:portal:button:1:type": "link",
      "hey:portal:button:1:target": HOST,
      "hey:portal:button:2": "POST",
      "hey:portal:button:2:type": "submit",*/
    },

  };
}

export default async function Page() {
  return (
    <div className="pl-4 pt-4">
      <center>
      <h1 className="pb-2 text-4xl">Ham LP Viewer <span className="text-2xl">by MassHesteria</span></h1>
      <div>
        <a className="text-red-600 text-2xl no-underline hover:underline pr-8" href="https://github.com/masshesteria/ham-lp">Source code</a>
        <a className="text-purple-600 text-2xl no-underline hover:underline" href="https://warpcast.com/masshesteria/0xec2772dc">Original cast</a>
      </div>
      {/*<img className="mt-4 border border-black" style={{ maxWidth: '80%' }} alt="View Ham LPs" src="/page?u=masshesteria&a=220&b=219"></img>*/}
      </center>
    </div>
  )
}
