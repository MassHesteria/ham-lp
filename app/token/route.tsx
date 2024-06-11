import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getHostName } from '../frames';

const hash = '0x68f343bC08D1C093754a74F2b45a69A2f1A42872'
const addr = '0xF6b32563920C67AE96879A2660759ec453e4B818'

function objectToQueryString(params: any) {
  return Object.entries(params)
    .map(
      ([key, value]: [any, any]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

type TokenTx = {
  id: number,
  timestamp: number
}

async function fetchPaginatedData(
  apiUrl: string,
  onSuccess: (a: number) => void,
  onError: (err: any) => void
) {
  let hasNextPage = true;
  let nextPageParams = {};

  while (hasNextPage) {
    // Construct the URL with the next page parameters
    const queryString = Object.keys(nextPageParams).length
      ? `?${objectToQueryString(nextPageParams)}`
      : "";
    const url = `${apiUrl}${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        const recv: TokenTx[] = []
        const sent: TokenTx[] = []

        data.items.forEach((item: any) => {
          if (item.from.hash === addr) {
            sent.push({
              id: parseInt(item.total.token_id),
              timestamp: Date.parse(item.timestamp),
            });
          } else if (item.to.hash == addr) {
            recv.push({
              id: parseInt(item.total.token_id),
              timestamp: Date.parse(item.timestamp),
            });
          }
        });

        recv.forEach((token) => {
          onSuccess(token.id)
        })
      }

      // Check if there are more pages to fetch
      if (data.next_page_params) {
        nextPageParams = data.next_page_params;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      onError(`Error fetching data: ${error}`);
      hasNextPage = false; // Exit loop on error
    }
  }
}

const getLabel = async (idx: string) => {
  const data = await fetch(getHostName() + `/label?i=${idx}`)
  return await data.arrayBuffer()
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('i')

  if (id === null) {
    return NextResponse.json({ error: 'Missing argument' }, { status: 500 })
  }

  const route = `https://ham.calderaexplorer.xyz/api/v2/tokens/0x68f343bC08D1C093754a74F2b45a69A2f1A42872/instances/${id}`
  const data = await fetch(route)
  const json = await data.json()

  // Extract the Base64 data part
  const base64Data = json.metadata.image
  const [, base64] = base64Data.split(',');
  
  const back = await getLabel(id)

  // Decode the Base64 string into an SVG string
  const svg = Buffer.from(base64, 'base64')

  const framedPng = await sharp({
    create: { width: 360, height: 360, channels: 3, background: "#f8f8f2" },
  }).composite([
    { input: svg }
  ])
  .png()
  .toBuffer()

  const resized = await sharp(framedPng)
    .resize(232, 232)
    .png()
    .toBuffer()

  const pngBuffer = await sharp(back)
    .composite([
      { input: resized, gravity: 'south'}
    ])
    .png().toBuffer()

  // Create the response with the appropriate headers
  const response = new NextResponse(pngBuffer)
  response.headers.set("Content-Type", "image/png");
  response.headers.set("Content-Length", `${pngBuffer.length}`);
  return response;
}