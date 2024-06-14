import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

const getBackground = async (username: string) => {
  return Buffer.from(
    await new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: "#8be9fd",
            background: "#282a36",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            paddingTop: "16px",
            display: "flex",
          }}
        >
          Ham LPs of @{username}
        </div>
      ),
      {
        width: 764,
        height: 400,
      }
    ).arrayBuffer()
  );
}

const getLabel = async (idx: string) => {
  return Buffer.from(
    await new ImageResponse(
      (
        <div
          style={{
            fontSize: 32,
            color: "#bd93f9",
            background: "#282a36",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            paddingTop: "6px",
            display: "flex",
          }}
        >
          #{idx}
        </div>
      ),
      {
        width: 232,
        height: 292,
      }
    ).arrayBuffer()
  );
};

const getToken = async (id: string) => {
  const contract = '0x68f343bC08D1C093754a74F2b45a69A2f1A42872'
  const route = `https://ham.calderaexplorer.xyz/api/v2/tokens/${contract}/instances/${id}`;
  const data = await fetch(route);
  const json = await data.json();

  // Extract the Base64 data part
  const base64Data = json.metadata.image;
  const [, base64] = base64Data.split(",");

  const back = await getLabel(id);

  // Decode the Base64 string into an SVG string
  const svg = Buffer.from(base64, "base64");

  const framedPng = await sharp({
    create: { width: 360, height: 360, channels: 3, background: "#f8f8f2" },
  })
    .composite([{ input: svg }])
    .png()
    .toBuffer();

  const resized = await sharp(framedPng).resize(232, 232).png().toBuffer();

  return await sharp(back)
    .composite([{ input: resized, gravity: "south" }])
    .png()
    .toBuffer();
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const usr = searchParams.get("u");
  const one = searchParams.get("a");
  const two = searchParams.get("b");

  if (usr === null || one === null) {
    return NextResponse.json({ error: "Invalid arguments" }, { status: 500 });
  }

  const back = await getBackground(usr);
  const images: any[] =
    two === null
      ? [{ input: await getToken(one), left: 244, top: 76 }]
      : [
          { input: await getToken(one), left: 96, top: 76 },
          { input: await getToken(two), left: 434, top: 76 },
        ];

  const pngBuffer = await sharp(back)
    .composite(images)
    .resize(764, 400, {
      fit: "contain",
      position: "south",
      background: "#282a36",
    })
    .png()
    .toBuffer();

  const response = new NextResponse(pngBuffer);
  response.headers.set("Content-Type", "image/png");
  response.headers.set("Content-Length", `${pngBuffer.length}`);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}