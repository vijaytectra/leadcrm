# Integration Setup Guides

This document provides step-by-step instructions for setting up integrations with various advertising platforms and communication channels.

## Table of Contents

1. [Google Ads Integration](#google-ads-integration)
2. [Meta (Facebook/Instagram) Integration](#meta-facebookinstagram-integration)
3. [LinkedIn Marketing Integration](#linkedin-marketing-integration)
4. [WhatsApp Business Integration](#whatsapp-business-integration)
5. [Webhook Configuration](#webhook-configuration)
6. [Troubleshooting](#troubleshooting)

## Google Ads Integration

### Prerequisites

- Google Ads account with admin access
- Google Ads API access enabled
- Developer token (requires Google Ads API certification)

### Step 1: Enable Google Ads API

1. Visit [Google Ads API Center](https://ads.google.com/home/tools/api-center/)
2. Sign in with your Google Ads account
3. Click "Get Started" to enable the API
4. Complete the API certification process if required

### Step 2: Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Ads API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:4000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Download the credentials JSON file

### Step 3: Get Developer Token

1. In Google Ads API Center, request a developer token
2. Wait for approval (can take 1-2 business days)
3. Note down your developer token

### Step 4: Configure in LEAD101

1. Go to Integration Hub in your LEAD101 dashboard
2. Click "Add Integration" → "Google Ads"
3. Enter the following credentials:
   - **Developer Token**: Your approved developer token
   - **Client ID**: From your OAuth2 credentials
   - **Client Secret**: From your OAuth2 credentials
   - **Refresh Token**: Generated during OAuth flow
   - **Customer ID**: Your Google Ads customer ID (format: 123-456-7890)

### Step 5: Test Integration

1. Click "Test Connection" to verify credentials
2. Check webhook URL is accessible
3. Create a test lead form in Google Ads
4. Verify leads appear in your LEAD101 dashboard

## Meta (Facebook/Instagram) Integration

### Prerequisites

- Facebook Business account
- Facebook App with Marketing API access
- Page with lead generation ads

### Step 1: Create Facebook App

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business"
3. Enter app name and contact email
4. Add Facebook Login product
5. Note your App ID and App Secret

### Step 2: Configure Marketing API

1. In your app dashboard, go to "Products" → "Marketing API"
2. Add the product if not already added
3. Go to "Tools" → "Graph API Explorer"
4. Generate a long-lived access token:
   - Select your app
   - Generate token with `leads_retrieval` permission
   - Exchange for long-lived token (60 days)

### Step 3: Get Page ID

1. Go to your Facebook Page
2. Click "About" → "Page Info"
3. Note your Page ID (numeric)

### Step 4: Configure in LEAD101

1. Go to Integration Hub → "Add Integration" → "Meta"
2. Enter credentials:
   - **App ID**: From your Facebook app
   - **App Secret**: From your Facebook app
   - **Access Token**: Long-lived access token
   - **Page ID**: Your Facebook page ID

### Step 5: Set Up Webhook

1. In Facebook App settings, go to "Webhooks"
2. Add webhook URL: `https://yourdomain.com/api/webhooks/leads/your-tenant/meta`
3. Subscribe to `leadgen` events
4. Verify webhook with your verify token

## LinkedIn Marketing Integration

### Prerequisites

- LinkedIn Business account
- LinkedIn Campaign Manager access
- LinkedIn Marketing Developer Platform access

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Click "Create App"
3. Fill in app details:
   - App name: Your company name
   - LinkedIn Page: Your company page
   - Privacy policy URL: Your privacy policy
   - App logo: Your company logo
4. Request access to Marketing Developer Platform
5. Wait for approval (1-3 business days)

### Step 2: Get API Credentials

1. In your app dashboard, go to "Auth"
2. Note your Client ID and Client Secret
3. Add redirect URL: `https://yourdomain.com/auth/linkedin/callback`
4. Generate access token with required scopes:
   - `r_organization_social`
   - `w_organization_social`
   - `rw_organization_media`

### Step 3: Get Organization ID

1. Go to LinkedIn Campaign Manager
2. Click on your organization name
3. Note the organization ID from the URL

### Step 4: Configure in LEAD101

1. Go to Integration Hub → "Add Integration" → "LinkedIn"
2. Enter credentials:
   - **Client ID**: From your LinkedIn app
   - **Client Secret**: From your LinkedIn app
   - **Access Token**: Generated access token
   - **Organization ID**: Your LinkedIn organization ID

## WhatsApp Business Integration

### Prerequisites

- WhatsApp Business account
- Meta Business account
- Phone number for WhatsApp Business

### Step 1: Set Up WhatsApp Business API

1. Go to [Meta Business](https://business.facebook.com/)
2. Create or select your business account
3. Go to "WhatsApp Business Platform"
4. Click "Get Started"
5. Add your phone number
6. Verify your phone number via SMS/call

### Step 2: Get API Credentials

1. In WhatsApp Business Platform, go to "API Setup"
2. Note your:
   - **Phone Number ID**: From the API setup page
   - **Business Account ID**: From the API setup page
3. Generate a permanent access token
4. Note your access token

### Step 3: Configure Message Templates

1. Go to "Message Templates"
2. Create templates for different use cases:
   - Welcome messages
   - Follow-up messages
   - Appointment reminders
3. Submit templates for approval
4. Wait for approval (1-2 business days)

### Step 4: Configure in LEAD101

1. Go to Integration Hub → "Add Integration" → "WhatsApp"
2. Enter credentials:
   - **Access Token**: Your permanent access token
   - **Phone Number ID**: From API setup
   - **Business Account ID**: From API setup

### Step 5: Test WhatsApp Integration

1. Go to Telecaller dashboard
2. Select a lead with phone number
3. Click "Send WhatsApp Message"
4. Test with a verified phone number
5. Verify message delivery

## Webhook Configuration

### Webhook URLs

Each integration has a unique webhook URL:

- **Google Ads**: `https://yourdomain.com/api/webhooks/leads/your-tenant/google-ads`
- **Meta**: `https://yourdomain.com/api/webhooks/leads/your-tenant/meta`
- **LinkedIn**: `https://yourdomain.com/api/webhooks/leads/your-tenant/linkedin`

### Webhook Security

1. **Signature Verification**: All webhooks use HMAC-SHA256 signatures
2. **HTTPS Required**: Webhooks must be served over HTTPS
3. **Rate Limiting**: Webhooks are rate-limited to prevent abuse
4. **IP Whitelisting**: Consider whitelisting platform IPs

### Testing Webhooks

Use tools like ngrok for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 4000

# Use ngrok URL as webhook URL
# Example: https://abc123.ngrok.io/api/webhooks/leads/your-tenant/google-ads
```

## Troubleshooting

### Common Issues

#### 1. Integration Not Receiving Leads

**Symptoms**: Integration shows as active but no leads are imported

**Solutions**:

- Verify webhook URL is accessible
- Check webhook signature verification
- Ensure lead forms are properly configured
- Check platform-specific requirements

#### 2. Authentication Errors

**Symptoms**: "Invalid credentials" or "Authentication failed"

**Solutions**:

- Verify all credentials are correct
- Check token expiration (refresh if needed)
- Ensure proper permissions are granted
- Test credentials in platform's API explorer

#### 3. Duplicate Leads

**Symptoms**: Same lead imported multiple times

**Solutions**:

- Check deduplication settings
- Verify external ID mapping
- Review lead source tracking
- Check for multiple webhook subscriptions

#### 4. Webhook Not Receiving Data

**Symptoms**: Webhook URL returns 404 or timeout

**Solutions**:

- Verify webhook URL is correct
- Check server logs for errors
- Ensure HTTPS is enabled
- Test webhook with curl:

```bash
curl -X POST https://yourdomain.com/api/webhooks/leads/your-tenant/google-ads \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Platform-Specific Issues

#### Google Ads

- Ensure developer token is approved
- Check customer ID format (123-456-7890)
- Verify OAuth2 flow completed
- Check API quotas and limits

#### Meta/Facebook

- Verify app has Marketing API access
- Check page permissions
- Ensure long-lived token is valid
- Verify webhook subscription

#### LinkedIn

- Ensure Marketing Developer Platform access
- Check organization permissions
- Verify access token scopes
- Check API rate limits

#### WhatsApp

- Verify phone number is approved
- Check message template approval
- Ensure business verification
- Test with verified numbers only

### Getting Help

1. **Check Logs**: Review server logs for detailed error messages
2. **Test Credentials**: Use platform API explorers to test credentials
3. **Contact Support**: Reach out to LEAD101 support team
4. **Platform Support**: Contact platform-specific support if needed

### Best Practices

1. **Regular Testing**: Test integrations regularly
2. **Monitor Health**: Use integration health monitoring
3. **Backup Credentials**: Store credentials securely
4. **Update Tokens**: Refresh tokens before expiration
5. **Monitor Quotas**: Watch API usage and limits
6. **Security**: Use HTTPS and secure credential storage
