import { NextResponse } from 'next/server';
import { contactSchema } from '../../_lib/contact-schema';
import { sendContactEmail } from '../../_lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM || !process.env.CONTACT_TO) {
    return NextResponse.json({ success: false, error: 'CONTACT_NOT_CONFIGURED' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const onlyHoneypotFailed = Object.keys(fieldErrors).length === 1 && 'company' in fieldErrors;
    if (onlyHoneypotFailed) {
      return NextResponse.json({ success: true, data: { id: 'noop' } }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'VALIDATION', fieldErrors }, { status: 422 });
  }

  const { name, email, topic, message } = parsed.data;

  try {
    const id = await sendContactEmail({ name, email, topic, message });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error sending email.';
    return NextResponse.json({ success: false, error: 'SEND_FAILED', detail }, { status: 502 });
  }
}
