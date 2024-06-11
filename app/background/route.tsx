import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const usr = searchParams.get('u')
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: '#8be9fd',
          background: '#282a36',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {usr}
      </div>
    ),
    {
      width: 764,
      height: 370,
    },
  );
}