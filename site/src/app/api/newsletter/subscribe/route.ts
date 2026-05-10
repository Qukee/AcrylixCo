import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  // TODO: persist + send to Resend / Klaviyo when integrated. For now, log
  // and acknowledge — Phase 2.6 wires real fulfilment.
  console.log('newsletter subscribe:', email);
  return NextResponse.redirect(new URL('/?subscribed=1', req.url), 303);
}
