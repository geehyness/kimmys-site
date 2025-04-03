import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  // First get the cookie store
  const cookieStore = await cookies(); // Add the 'await' keyword here
  // Then get the cookie
  const isAuthenticatedCookie = cookieStore.get('isAuthenticated');
  const isAuthenticated = isAuthenticatedCookie?.value === 'true';

  console.log("req: ", request)

  if (isAuthenticated) {
    return NextResponse.json({ isAuthenticated: true }, { status: 200 });
  } else {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}