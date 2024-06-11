import { NextRequest, NextResponse } from 'next/server';

function objectToQueryString(params: any) {
  return Object.entries(params)
    .map(
      ([key, value]: [any, any]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

type TokenTx = {
  id: number,
  timestamp: number
}

async function fetchPaginatedData(
  apiUrl: string,
  addr: string,
  onSuccess: (a: number) => void,
  onError: (err: any) => void
) {
  let hasNextPage = true;
  let nextPageParams = {};

  while (hasNextPage) {
    // Construct the URL with the next page parameters
    const queryString = Object.keys(nextPageParams).length
      ? `?${objectToQueryString(nextPageParams)}`
      : "";
    const url = `${apiUrl}${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        const recv: TokenTx[] = []
        const sent: TokenTx[] = []

        data.items.forEach((item: any) => {
          if (item.from.hash.toLowerCase() === addr.toLowerCase()) {
            sent.push({
              id: parseInt(item.total.token_id),
              timestamp: Date.parse(item.timestamp),
            });
          } else if (item.to.hash.toLowerCase() == addr.toLowerCase()) {
            recv.push({
              id: parseInt(item.total.token_id),
              timestamp: Date.parse(item.timestamp),
            });
          }
        });

        recv.forEach((token) => {
          onSuccess(token.id)
        })
      }

      // Check if there are more pages to fetch
      if (data.next_page_params) {
        nextPageParams = data.next_page_params;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      onError(`Error fetching data: ${error}`);
      hasNextPage = false; // Exit loop on error
    }
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const addr = searchParams.get('a')

  if (addr === null) {
    return NextResponse.json({ error: 'Missing argument' }, { status: 500 })
  }

  const hash = '0x68f343bC08D1C093754a74F2b45a69A2f1A42872'
  const route = `https://ham.calderaexplorer.xyz/api/v2/addresses/${addr}/token-transfers?type=ERC-721&filter=to%20%7C%20from&token=${hash}`
  let tokens: number[] = []
  await fetchPaginatedData(
    route,
    addr,
    (token: number) => tokens.push(token),
    (err: any) => console.error(err)
  );

  //let output = `Number of Tokens: ${tokens.length}\n\n`
  //output += JSON.stringify(tokens, null, 2)
  return NextResponse.json({ tokens })
}