const fetch = require('node-fetch');
require('dotenv').config();

let accessToken = null;
let expiresAt = 0;

async function refreshTwitchToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Twitch client ID or client secret in environment variables.');
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Failed to refresh Twitch token: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  expiresAt = Date.now() + (data.expires_in * 1000) - 60000; // refresh 1 minute before expiry

  return accessToken;
}

async function getAccessToken() {
  if (!accessToken || Date.now() >= expiresAt) {
    await refreshTwitchToken();
  }
  return accessToken;
}

module.exports = {
  getAccessToken,
};
