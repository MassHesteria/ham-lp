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
          <span>Ham LPs of @{usr}</span>
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
}