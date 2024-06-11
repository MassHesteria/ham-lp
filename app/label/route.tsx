
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const idx = searchParams.get('i')
  return new ImageResponse(
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
}