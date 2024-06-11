import { NextRequest, NextResponse } from "next/server"
import { getHostName } from "../frames"
import sharp from "sharp"

const getBackground = async (username: string) => {
  const data = await fetch(getHostName() + `/background?u=${username}`)
  return await data.arrayBuffer()
}

const getImage = async (id: string, left: number, top: number): Promise<any> => {
  const data = await fetch(getHostName() + `/token?i=${id}`)
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