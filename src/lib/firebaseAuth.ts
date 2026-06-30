import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Gmail scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// On Auth State Changed Listener
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Try to load any cached token from local storage if available
  const savedToken = localStorage.getItem('g_token');
  if (savedToken) {
    cachedAccessToken = savedToken;
  }

  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('g_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In Flow
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    // Save to localStorage so it persists across page updates
    localStorage.setItem('g_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = localStorage.getItem('g_token');
  }
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('g_token');
};

// Utility to safely base64url encode strings containing Unicode/Hindi characters
function base64urlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = window.btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Send email using Google Gmail API
export async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  bodyHtml: string
): Promise<any> {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${window.btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyHtml
  ];
  const emailRaw = emailLines.join('\r\n');
  const base64UrlEncoded = base64urlEncode(emailRaw);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64UrlEncoded,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gmail API Error Response:', errText);
    throw new Error(`Gmail API returned error status: ${response.status}`);
  }

  return response.json();
}

// Send Welcome Email helper
export async function sendWelcomeEmail(accessToken: string, toEmail: string, userName: string) {
  const subject = 'Welcome to JanSewa India - Account Created Successfully!';
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-xl: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
        <span style="font-size: 24px; font-weight: 900; color: #1e3a8a; tracking-tight: -0.025em;">JanSewa <span style="color: #ea580c;">India</span></span>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: bold; margin: 5px 0 0 0;">National Civic Grievance Cell</p>
      </div>
      <h3 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-top: 0;">Welcome to the Platform, ${userName}!</h3>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Thank you for joining JanSewa, India's unified citizen grievance resolution initiative. Your account has been successfully created and linked with your Gmail account.
      </p>
      <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-size: 12px; font-weight: bold; color: #0f172a;">Your Registered Access Details:</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #475569;">Email: <strong>${toEmail}</strong></p>
        <p style="margin: 3px 0 0 0; font-size: 12px; color: #475569;">Verified Identity Source: <strong>Google Accounts Secure SSO</strong></p>
      </div>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        You can now file issues with precision GIS tracking, describe defects using voice recorders, and track real-time resolution from municipal ward engineers.
      </p>
      <div style="text-align: center; margin-top: 30px; border-top: 2px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 12px; font-weight: bold; color: #1e3a8a; margin: 0;">Jai Hind!</p>
        <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">JanSewa Grievance Redressal Initiative, MoHUA</p>
      </div>
    </div>
  `;

  try {
    await sendGmailEmail(accessToken, toEmail, subject, htmlBody);
    console.log('Welcome email dispatched successfully to:', toEmail);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
}

// Send Complaint Confirmation Email helper
export async function sendComplaintEmail(
  accessToken: string,
  toEmail: string,
  citizenName: string,
  complaint: {
    id: string;
    category: string;
    title: string;
    description: string;
    landmark: string;
    ward: string;
  },
  origin: string
) {
  const subject = `JanSewa Complaint Registered: ${complaint.id} - ${complaint.category}`;
  const trackingLink = `${origin}/complaint/${complaint.id}`;
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
        <span style="font-size: 24px; font-weight: 900; color: #1e3a8a; tracking-tight: -0.025em;">JanSewa <span style="color: #ea580c;">India</span></span>
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: bold; margin: 5px 0 0 0;">Official Grievance Receipt</p>
      </div>
      <h3 style="color: #b45309; font-size: 18px; font-weight: 800; margin-top: 0; text-align: center;">Grievance Registration Confirmation</h3>
      <p style="font-size: 13px; line-height: 1.6; color: #334155;">
        Dear ${citizenName}, your civic grievance has been successfully submitted and dispatched to the local municipal engineering desk.
      </p>
      
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 12.5px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; width: 35%;">Parameter</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold;">Registered Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Grievance ID</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace; color: #1e3a8a; font-size: 13px;">${complaint.id}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Category</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${complaint.category}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Subject</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 600;">${complaint.title}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Location Landmark</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1;">${complaint.landmark}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #475569;">Assigned Ward</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-style: italic;">${complaint.ward}</td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${trackingLink}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; font-size: 13px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.25);">
          Track Complaint Status Real-Time
        </a>
      </div>

      <p style="font-size: 12px; line-height: 1.5; color: #64748b; font-style: italic; background-color: #f8fafc; padding: 12px; border-radius: 6px;">
        Note: The standard resolution SLA for ${complaint.category} grievances in ${complaint.ward} is 24 to 72 hours. You will receive progress notifications as local technicians update the file.
      </p>

      <div style="text-align: center; margin-top: 30px; border-top: 2px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 12px; font-weight: bold; color: #1e3a8a; margin: 0;">Jai Hind!</p>
        <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">JanSewa Grievance Redressal Cell, MoHUA</p>
      </div>
    </div>
  `;

  try {
    await sendGmailEmail(accessToken, toEmail, subject, htmlBody);
    console.log('Complaint receipt email dispatched successfully to:', toEmail);
  } catch (err) {
    console.error('Failed to send complaint receipt email:', err);
  }
}
