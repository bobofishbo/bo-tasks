/**
 * One-time script to get a Google Calendar OAuth refresh token.
 *
 * Prerequisites (Google Cloud Console):
 *   1. Create a project → Enable "Google Calendar API"
 *   2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
 *      Application type: Web application
 *      Authorized redirect URI: http://localhost:9876/callback
 *   3. Download the client secret — copy Client ID and Client Secret
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-gcal-token.mjs
 *
 * After running, add to .env.local:
 *   GOOGLE_CLIENT_ID=xxx
 *   GOOGLE_CLIENT_SECRET=yyy
 *   GOOGLE_REFRESH_TOKEN=<printed below>
 *   GOOGLE_CALENDAR_IDS=primary
 *   # GOOGLE_CLASSES_CALENDAR_IDS=your-classes-cal-id@group.calendar.google.com
 */

import { createServer } from 'http';
import { google } from 'googleapis';

const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = process.env;
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before running.');
  process.exit(1);
}

const REDIRECT = 'http://localhost:9876/callback';
const auth = new google.auth.OAuth2(clientId, clientSecret, REDIRECT);

const authUrl = auth.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  prompt: 'consent',
});

console.log('\nOpen this URL in your browser to authorize:\n');
console.log(authUrl);
console.log('\nWaiting on http://localhost:9876/callback ...\n');

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith('/callback')) return;
  const code = new URL(req.url, 'http://localhost:9876').searchParams.get('code');
  if (!code) { res.end('No code'); return; }
  try {
    const { tokens } = await auth.getToken(code);
    res.end('<h1>Done! Check your terminal.</h1><p>You can close this tab.</p>');
    console.log('\n✓ Refresh token obtained. Add these to your .env.local:\n');
    console.log(`GOOGLE_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\n# Calendar IDs to show (comma-separated). "primary" = your main calendar.');
    console.log('GOOGLE_CALENDAR_IDS=primary');
    console.log('\n# Optional: comma-separated calendar IDs whose events should appear as "class"');
    console.log('# GOOGLE_CLASSES_CALENDAR_IDS=');
  } catch (e) {
    res.end('Error: ' + e.message);
    console.error(e);
  }
  server.close();
});

server.listen(9876);
