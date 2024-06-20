import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from "next/server"
import { getHostName } from "../frames"
import sharp from "sharp"

const getBackground = async (username: string) => {
  const data = new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: '#8be9fd',
          background: '#282a36',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          height: '93.5%'
          }}>
          <span>Ham LPs of @{username}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          fontSize: 16,
          paddingRight: '6px',
          paddingBottom: '16px',
          color: '#6272a4'
          }}>
          by @masshesteria
        </div>
      </div>
    ),
    {
      width: 764,
      height: 400,
    },
  );
  return await data.arrayBuffer()
}

const getImage = async (id: string, left: number, top: number): Promise<any> => {
  const data = await fetch(getHostName() + `/token/${id}`)
  const buffer = await data.arrayBuffer()
  return { input: Buffer.from(buffer), left, top }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const usr = searchParams.get('u')
  const one = searchParams.get('a')
  const two = searchParams.get('b')

  if (usr === null || one === null) {
    return NextResponse.json({ error: 'Invalid arguments' }, { status: 500 })
  }

  const back = await getBackground(usr)
  const images: any[] =
    two === null ? [
      await getImage(one, 244, 76)
    ]
    : [
      await getImage(one, 96, 76),
      await getImage(two, 434, 76),
    ]

  const pngBuffer = await sharp(back)
  .composite(images)
  .resize(764, 400, { fit: 'contain', position: 'south', background: '#282a36'})
  .png()
  .toBuffer()
  const response = new NextResponse(pngBuffer)
  response.headers.set("Content-Type", "image/png");
  response.headers.set("Content-Length", `${pngBuffer.length}`);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}