import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export async function GET(_: NextRequest) {
  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full justify-center items-center"
        style={{ backgroundColor: "#282a36" }}
      >
        <div tw="flex">
          <span tw="text-5xl" style={{ color: "#f8f8f2" }}>
            View Ham LPs by Owner
          </span>
        </div>
        <div tw="flex">
          <span tw="text-4xl" style={{ color: "#ffb86c" }}>by @masshesteria</span>
        </div>
      </div>
    ),
    {
      width: 764,
      height: 400,
    },
  );
}