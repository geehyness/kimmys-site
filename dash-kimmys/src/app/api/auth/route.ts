import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword } from '@/lib/passwordUtils';
import { client } from '@/lib/sanityClient';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  try {
    const adminUser = await client.fetch(
      `*[_type == "adminUser" && username == $username][0]`,
      { username }
    );

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(
      password,
      adminUser.passwordHash,
      adminUser.salt
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // First get the cookie store
    const cookieStore = await cookies(); // AWAIT the cookies() call
    // Then set the cookie
    cookieStore.set({
      name: 'isAuthenticated',
      value: 'true',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}