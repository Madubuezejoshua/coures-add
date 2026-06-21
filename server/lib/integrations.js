// Paystack, Cloudflare R2 and email integrations. Each degrades to a safe
// mock when its keys are still placeholders, so the app works end-to-end in
// development and "just works" once real keys are added to .env.

const PLACEHOLDER = /^(your-|sk_test_xxx|pk_test_xxx|<|$)|xxx|example\.com/i;
const isReal = (v) => !!v && !PLACEHOLDER.test(v);

export const paystackConfigured = isReal(process.env.PAYSTACK_SECRET_KEY);
export const emailConfigured = isReal(process.env.SENDGRID_API_KEY);

// S3-compatible object storage — Backblaze B2 (preferred) or Cloudflare R2.
const STORAGE = {
  accessKeyId: process.env.B2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.B2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.B2_ENDPOINT || process.env.R2_ENDPOINT,
  bucket: process.env.B2_BUCKET || process.env.R2_BUCKET,
  region: process.env.B2_REGION || process.env.R2_REGION || 'auto',
};

export const storageConfigured =
  isReal(STORAGE.accessKeyId) && isReal(STORAGE.secretAccessKey) && isReal(STORAGE.endpoint) && isReal(STORAGE.bucket);

let _client = null;
async function getClient() {
  if (_client) return _client;
  const { S3Client } = await import('@aws-sdk/client-s3');
  _client = new S3Client({
    region: STORAGE.region,
    endpoint: STORAGE.endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId: STORAGE.accessKeyId, secretAccessKey: STORAGE.secretAccessKey },
  });
  return _client;
}

/** Upload a buffer to the bucket. Returns true on success. */
export async function storageUpload(key, body, contentType) {
  if (!storageConfigured) return false;
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = await getClient();
  await client.send(new PutObjectCommand({ Bucket: STORAGE.bucket, Key: key, Body: body, ContentType: contentType }));
  return true;
}

/** Short-lived presigned GET URL (private bucket downloads). */
export async function storagePresignGet(key, expiresIn = 600) {
  if (!storageConfigured) return null;
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  const client = await getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: STORAGE.bucket,
      Key: key,
      ResponseContentDisposition: 'inline',
    }),
    { expiresIn }
  );
}

/** Initialise a Paystack transaction; mock-completes instantly if unconfigured. */
export async function paystackInit({ email, amountKobo, reference, metadata }) {
  if (!paystackConfigured) {
    return { mock: true, status: true, reference, authorization_url: null };
  }
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: amountKobo, reference, metadata }),
  });
  const json = await res.json();
  return { mock: false, status: json.status, reference, authorization_url: json.data?.authorization_url };
}

export async function paystackVerify(reference) {
  if (!paystackConfigured) return { mock: true, status: 'success' };
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const json = await res.json();
  return { mock: false, status: json.data?.status };
}

export async function sendEmail(to, subject, text) {
  if (!emailConfigured) {
    console.log(`[email:mock] to=${to} subject="${subject}"`);
    return;
  }
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM || 'no-reply@docreview.app' },
        subject,
        content: [{ type: 'text/plain', value: text }],
      }),
    });
  } catch (e) {
    console.error('sendEmail error', e.message);
  }
}
