import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';

const welcomeHtml = (firstName: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Learned</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Wordmark -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.15em;color:#1e293b;text-transform:uppercase;">LEARNED</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 40px 36px;border:1px solid #e2e8f0;">

              <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">
                Welcome, ${firstName}.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">
                It's great to have you here.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">
                Learned exists for one reason — to help law students across Nigeria understand what is actually expected of them, and to build the habits that guarantee results.
              </p>

              <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7;">
                The gap between what students think is expected and what lecturers actually reward is one of the most overlooked problems in Nigerian legal education. We're here to close it.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr><td style="border-top:1px solid #f1f5f9;"></td></tr>
              </table>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;letter-spacing:0.05em;">PRACTICE (MCQ)</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">Test yourself topic by topic. Every time you retrieve an answer from memory, your understanding of it deepens. That's retrieval learning — and it works.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;letter-spacing:0.05em;">IRAC PROBLEM QUESTIONS</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">Practise identifying legal issues, stating the applicable rule, and applying it to the facts. The skill you build here is the same skill you'll use in practice.</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;letter-spacing:0.05em;">WEEKLY FOCUS</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">Each week, the most important things to know across your courses are surfaced for you. No guessing where to direct your attention.</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr><td style="border-top:1px solid #f1f5f9;"></td></tr>
              </table>

              <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">
                We're building something bigger than a study app — a collective intelligence system, a living knowledge base drawn from students and lecturers past and present. Every student on this platform benefits from the insight of everyone who came before them.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://learned.reforma.ng" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;letter-spacing:0.05em;padding:14px 32px;border-radius:8px;">
                      START PRACTISING →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">
                You're receiving this because you signed up for Learned.
              </p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © 2026 Learned · <a href="https://learned.reforma.ng" style="color:#94a3b8;">learned.reforma.ng</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

serve(async (req) => {
  try {
    const payload = await req.json();

    // Supabase database webhook sends { type, table, record, ... }
    const record = payload?.record;
    const email = record?.email;
    if (!email) {
      return new Response(JSON.stringify({ error: 'No email in payload' }), { status: 400 });
    }

    const meta = record?.raw_user_meta_data ?? {};
    const firstName =
      meta.first_name ||
      (meta.full_name ? meta.full_name.split(' ')[0] : null) ||
      'there';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LEARNED <noreply@reforma.ng>',
        to: [email],
        subject: 'Welcome to Learned.',
        html: welcomeHtml(firstName),
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('welcome-email error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
