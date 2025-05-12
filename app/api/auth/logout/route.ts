import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the current user by clearing the authentication cookie
 *     responses:
 *       200:
 *         description: Logout successful
 */
export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );
  
  // Clear cookie
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
    maxAge: 0,
  });
  
  return response;
}