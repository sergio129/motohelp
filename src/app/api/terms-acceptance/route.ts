import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { setCORSHeaders } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 50 solicitudes por hora
    const rateLimitCheck = checkRateLimit(request, 50, 60 * 60 * 1000);
    if (!rateLimitCheck.allowed && rateLimitCheck.response) {
      return setCORSHeaders(rateLimitCheck.response, request.headers.get('origin'));
    }

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return setCORSHeaders(
        new NextResponse(JSON.stringify({ error: 'No autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
        request.headers.get('origin')
      );
    }

    // Parse request body
    const body = await request.json();
    const { acceptTerms, acceptPrivacy, acceptCookies } = body;

    // Validate at least terms acceptance
    if (!acceptTerms) {
      return setCORSHeaders(
        new NextResponse(JSON.stringify({ error: 'Debe aceptar los términos de servicio' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
        request.headers.get('origin')
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return setCORSHeaders(
        new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
        request.headers.get('origin')
      );
    }

    // Create or update terms acceptance record
    const termsAcceptance = await prisma.termsAcceptance.upsert({
      where: { userId: user.id },
      update: {
        acceptedTermsAt: acceptTerms ? new Date() : undefined,
        acceptedPrivacyAt: acceptPrivacy ? new Date() : undefined,
        acceptedCookiesAt: acceptCookies ? new Date() : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        termsVersion: '1.0',
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: acceptPrivacy ? new Date() : null,
        acceptedCookiesAt: acceptCookies ? new Date() : null,
      },
    });

    return setCORSHeaders(
      new NextResponse(
        JSON.stringify({
          success: true,
          message: 'Términos aceptados correctamente',
          termsAcceptance,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
      request.headers.get('origin')
    );
  } catch (error) {
    console.error('[TERMS_ACCEPTANCE_ERROR]', error);
    return setCORSHeaders(
      new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
      request.headers.get('origin')
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return setCORSHeaders(
        new NextResponse(JSON.stringify({ error: 'No autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
        request.headers.get('origin')
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return setCORSHeaders(
        new NextResponse(JSON.stringify({ error: 'Usuario no encontrado' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
        request.headers.get('origin')
      );
    }

    // Get terms acceptance
    const termsAcceptance = await prisma.termsAcceptance.findUnique({
      where: { userId: user.id },
    });

    return setCORSHeaders(
      new NextResponse(
        JSON.stringify({
          success: true,
          termsAcceptance: termsAcceptance || null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
      request.headers.get('origin')
    );
  } catch (error) {
    console.error('[TERMS_ACCEPTANCE_GET_ERROR]', error);
    return setCORSHeaders(
      new NextResponse(JSON.stringify({ error: 'Error interno del servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
      request.headers.get('origin')
    );
  }
}
