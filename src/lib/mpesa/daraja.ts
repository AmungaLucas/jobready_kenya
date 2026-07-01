/**
 * M-Pesa Daraja API Integration
 *
 * Environment variables required:
 *   MPESA_CONSUMER_KEY      - Daraja app consumer key
 *   MPESA_CONSUMER_SECRET   - Daraja app consumer secret
 *   MPESA_PASSKEY           - Online passkey (from Daraja dashboard)
 *   MPESA_SHORTCODE         - Business shortcode (e.g. 174379)
 *   MPESA_IS_SANDBOX       - "true" for test, "false" for production
 *
 * The callback URL must be: https://jobboard.ke/api/payments/callback
 * Registered in Daraja dashboard under "C2B" or "LNMO" endpoints.
 */

const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_BASE = 'https://api.safaricom.co.ke';

function getBaseUrl(): string {
  return process.env.MPESA_IS_SANDBOX === 'true' ? SANDBOX_BASE : PRODUCTION_BASE;
}

// ─── OAuth Token ───────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Cache token for 50 minutes (Daraja tokens last 60 min)
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Daraja auth failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: string };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) - 600) * 1000, // Refresh 10 min early
  };

  return cachedToken.token;
}

// ─── STK Push ──────────────────────────────────────────────────

export interface STKPushResult {
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface STKPushRequest {
  /** Phone number in 254... format */
  phoneNumber: string;
  /** Amount in KES (whole number) */
  amount: number;
  /** Unique reference for this transaction */
  reference: string;
  /** Description shown on user's phone */
  description: string;
}

export async function initiateSTKPush(req: STKPushRequest): Promise<STKPushResult> {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    throw new Error('MPESA_SHORTCODE and MPESA_PASSKEY must be set');
  }

  // Generate password: Base64(Shortcode + Passkey + Timestamp)
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: req.amount,
    PartyA: req.phoneNumber,
    PartyB: shortcode,
    PhoneNumber: req.phoneNumber,
    CallBackURL: `${process.env.NEXTAUTH_URL || 'https://jobboard.ke'}/api/payments/callback`,
    AccountReference: req.reference.slice(0, 12), // Max 12 chars
    TransactionDesc: req.description.slice(0, 13), // Max 13 chars
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as Record<string, string>;

  if (data.ResponseCode === '0') {
    return {
      success: true,
      checkoutRequestId: data.CheckoutRequestID,
      responseCode: data.ResponseCode,
      responseDescription: data.ResponseDescription,
    };
  }

  return {
    success: false,
    errorCode: data.errorCode || data.ResponseCode,
    errorMessage: data.errorMessage || data.ResponseDescription || 'STK Push failed',
  };
}

// ─── Transaction Status Query ──────────────────────────────────

export interface TransactionStatus {
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  mpesaReceiptNumber?: string;
  amount?: number;
  phoneNumber?: string;
}

export async function queryTransactionStatus(
  checkoutRequestId: string,
  phoneNumber: string
): Promise<TransactionStatus> {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    throw new Error('MPESA_SHORTCODE and MPESA_PASSKEY must be set');
  }

  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const body = {
    Initiator: 'apitest',
    SecurityCredential: password,
    CommandID: 'TransactionStatusQuery',
    TransactionID: checkoutRequestId,
    OriginatorConversationID: checkoutRequestId,
    PartyA: shortcode,
    IdentifierType: '4',
    ResultURL: `${process.env.NEXTAUTH_URL || 'https://jobboard.ke'}/api/payments/status-callback`,
    QueueTimeOutURL: `${process.env.NEXTAUTH_URL || 'https://jobboard.ke'}/api/payments/status-callback`,
    Remark: 'Payment status check',
    Occasion: '',
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as Record<string, string>;

  return {
    success: data.ResultCode === '0',
    resultCode: data.ResultCode,
    resultDesc: data.ResultDesc,
  };
}

// ─── Callback Validation ───────────────────────────────────────

/**
 * Safely parse and validate an M-Pesa STK Push callback body.
 * Returns structured data or null if invalid.
 */
export interface MpesaCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: string;
  resultDesc: string;
  mpesaReceiptNumber?: string;
  amount?: number;
  phoneNumber?: string;
  transactionDate?: string;
}

export function parseCallback(body: unknown): MpesaCallbackData | null {
  try {
    const b = body as Record<string, unknown>;
    const stkCallback = b.StkCallback as Record<string, unknown> | undefined;
    if (!stkCallback) return null;

    const merchantReqId = stkCallback.MerchantRequestID as string;
    const checkoutReqId = stkCallback.CheckoutRequestID as string;
    const resultCode = String(stkCallback.ResultCode);
    const resultDesc = stkCallback.ResultDesc as string;

    const base: MpesaCallbackData = {
      merchantRequestId: merchantReqId,
      checkoutRequestId: checkoutReqId,
      resultCode,
      resultDesc,
    };

    // CallbackMetadata only present on success (ResultCode 0)
    if (resultCode === '0' && stkCallback.CallbackMetadata) {
      const metadata = (stkCallback.CallbackMetadata as Record<string, unknown>).Item as Array<Record<string, unknown>>;
      if (Array.isArray(metadata)) {
        for (const item of metadata) {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              base.mpesaReceiptNumber = String(item.Value);
              break;
            case 'Amount':
              base.amount = Number(item.Value);
              break;
            case 'PhoneNumber':
              base.phoneNumber = String(item.Value);
              break;
            case 'TransactionDate':
              base.transactionDate = String(item.Value);
              break;
          }
        }
      }
    }

    return base;
  } catch {
    return null;
  }
}

// ─── Phone Number Normalization ────────────────────────────────

/**
 * Normalize a Kenyan phone number to 254... format.
 * Accepts: 0712345678, +254712345678, 254712345678, +1-254712345678
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');

  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;
  if (digits.startsWith('07') || digits.startsWith('01')) return `254${digits.slice(1)}`;
  if (digits.startsWith('2547') || digits.startsWith('2541')) return digits;

  throw new Error(`Invalid Kenyan phone number: ${phone}`);
}

// ─── Pricing Constants ─────────────────────────────────────────

export const PRICING = {
  BASIC_PREMIUM_MONTHLY: 100,   // KES 100/mo — AI match scores
  PRO_PREMIUM_MONTHLY: 200,    // KES 200/mo — unlimited matches + explanations
  PRIORITY_APPLICATION: 50,     // KES 50 per application
  CV_REVIEW: 300,              // KES 300 one-time
  WHATSAPP_ALERTS_MONTHLY: 50, // KES 50/mo (add-on)
} as const;

export const ITEM_DESCRIPTIONS: Record<string, string> = {
  SUBSCRIPTION: 'JobBoard Premium',
  PRIORITY_APPLICATION: 'Priority Application',
  CV_REVIEW: 'AI CV Review',
  FEATURED_JOB: 'Featured Job Listing',
} as const;