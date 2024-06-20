import { NextRequest } from "next/server";
import { frames } from "../../frames";
import { deserializeFromBase64, getPage } from "../../generate";

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