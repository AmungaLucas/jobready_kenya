/**
 * M-Pesa B2C (Business to Customer) Payout Service
 *
 * Uses pre-generated SecurityCredential (from Daraja portal tool).
 * Sends money from business paybill to user's M-Pesa.
 */

import crypto from 'crypto';

const PRODUCTION_BASE = 'https://api.safaricom.co.ke';
const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';

function getBaseUrl(): string {
  return process.env.MPESA_IS_SANDBOX === 'true' ? SANDBOX_BASE : PRODUCTION_BASE;
}

// Reuse the token cache from daraja.ts
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
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
    expiresAt: Date.now() + (Number(data.expires_in) - 600) * 1000,
  };

  return cachedToken.token;
}

export interface B2CResult {
  success: boolean;
  conversationId?: string;
  originatorConversationId?: string;
  responseCode?: string;
  responseDescription?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface B2CPayoutRequest {
  /** Phone number in 254... format */
  phoneNumber: string;
  /** Amount in KES (whole number) */
  amount: number;
  /** Unique reference for this payout */
  reference: string;
  /** Description/remarks */
  remarks: string;
}

/**
 * Initiate a B2C payout (Business Payment).
 * Uses pre-generated SecurityCredential from env.
 */
export async function initiateB2CPayout(req: B2CPayoutRequest): Promise<B2CResult> {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const initiatorName = process.env.MPESA_INITIATOR_NAME;
  const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
  const resultUrl = process.env.MPESA_B2C_RESULT_URL;
  const timeoutUrl = process.env.MPESA_B2C_TIMEOUT_URL;

  if (!shortcode || !initiatorName || !securityCredential || !resultUrl || !timeoutUrl) {
    throw new Error('B2C environment variables not configured');
  }

  const originatorConversationId = crypto.randomUUID();

  const body = {
    OriginatorConversationID: originatorConversationId,
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: 'BusinessPayment',
    Amount: req.amount,
    PartyA: shortcode,
    PartyB: req.phoneNumber,
    Remarks: req.remarks.slice(0, 100),
    QueueTimeOutURL: timeoutUrl,
    ResultURL: resultUrl,
    Occasion: req.reference.slice(0, 100),
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/b2c/v3/paymentrequest`, {
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
      conversationId: data.ConversationID,
      originatorConversationId,
      responseCode: data.ResponseCode,
      responseDescription: data.ResponseDescription,
    };
  }

  return {
    success: false,
    errorCode: data.errorCode || data.ResponseCode,
    errorMessage: data.errorMessage || data.ResponseDescription || 'B2C payout failed',
  };
}

/**
 * Check M-Pesa account balance.
 */
export async function checkAccountBalance(): Promise<{ amount?: number; error?: string }> {
  const token = await getAccessToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const initiatorName = process.env.MPESA_INITIATOR_NAME;
  const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
  const resultUrl = process.env.MPESA_B2C_RESULT_URL;
  const timeoutUrl = process.env.MPESA_B2C_TIMEOUT_URL;

  if (!shortcode || !initiatorName || !securityCredential) {
    return { error: 'B2C env vars not configured' };
  }

  const body = {
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: 'AccountBalance',
    PartyA: shortcode,
    IdentifierType: '4',
    Remarks: 'Balance check',
    QueueTimeOutURL: timeoutUrl,
    ResultURL: resultUrl,
  };

  const res = await fetch(`${getBaseUrl()}/mpesa/accountbalance/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as Record<string, unknown>;
  return data as { amount?: number; error?: string };
}