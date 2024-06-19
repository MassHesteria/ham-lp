import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { getPage } from "@/app/frames/route";

const deserializeFromBase64 = (base64: string) => {
  const jsonString = Buffer.from(base64, 'base64').toString('utf-8');
  return JSON.parse(jsonString);
};

export async function GET(
   req: NextRequest,
   { params }: { params: { slug: string}}
) {
  const args = deserializeFromBase64(params.slug)

  const handler = frames(async (_: any) => {
    return getPage(args.n, args.f, args.t, args.i)
  })

  return handler(req)
}