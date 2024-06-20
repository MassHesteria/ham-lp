import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import { getHostName } from '../../frames';

export async function generateStaticParams() {
  const arr = []
  for (let i = 0; i < 1000; i++) {
    arr.push({ idx: `${i + 1}` })
  }
  return arr
}

const getLabel = async (idx: string) => {
  const data = new ImageResponse(
    (
      <div
        style={{
          fontSize: 32,
          color: '#bd93f9',
          background: '#282a36',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          paddingTop: '6px',
          display: 'flex'
        }}
      >
        #{idx}
      </div>
    ),
    {
      width: 232,
      height: 292,
    },
  );
  return await data.arrayBuffer()
}

export async function GET(
   req: NextRequest,
   { params }: { params: { idx: string }}
) {
  const id = params.idx

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