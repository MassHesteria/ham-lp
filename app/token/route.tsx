import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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
          console.log(item)
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
  
  // Decode the Base64 string into an SVG string
  const svg = Buffer.from(base64, 'base64')

  const framedPng = await sharp({
    create: { width: 360, height: 360, channels: 3, background: "#f8f8f2" },
  }).composite([
    { input: svg }
  ])
  .png().toBuffer()

  const pngBuffer = await sharp(framedPng)
    .resize(232, 292, { fit: 'contain', position: 'south', background: '#282a36'})
    .composite([
      {
        input: {
          text: {
            text: `<span foreground="#bd93f9" size="x-large">\n#${id}</span>`,
            rgba: true,
            width: 232,
            dpi: 122
          }
        },
        gravity: 'north'
      },
    ])
    .png().toBuffer()

  // Create the response with the appropriate headers
  const response = new NextResponse(pngBuffer)
  response.headers.set("Content-Type", "image/png");
  response.headers.set("Content-Length", `${pngBuffer.length}`);
  return response;
}