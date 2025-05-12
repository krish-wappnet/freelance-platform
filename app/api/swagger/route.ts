import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI specification for the API
 *     responses:
 *       200:
 *         description: The OpenAPI specification
 */
export async function GET() {
  const spec = getApiDocs();
  return NextResponse.json(spec);
}