# Dark Humor Quotes

**Dark Humor Quotes** is a production‑ready Node.js web application that delivers a never‑ending stream of dark humor and anti‑motivational quotes. This application is designed with modern security, SEO, and accessibility in mind and is deployed on Google Cloud Platform (GCP) using Cloud Run and Cloud SQL. Paid users benefit from an ad‑free experience with auto‑generated custom quotes powered by Vertex AI, while non‑paid users see unobtrusive ads.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Google Cloud Platform Setup](#google-cloud-platform-setup)
  - [Cloud SQL Configuration](#cloud-sql-configuration)
  - [Cloud Run Deployment](#cloud-run-deployment)
  - [Google SSO Setup](#google-sso-setup)
- [Stripe Configuration](#stripe-configuration)
- [Usage](#usage)
- [Account Management](#account-management)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License](#license)
- [Contact](#contact)

---

## Overview

**Dark Humor Quotes** provides a unique blend of dark humor and anti‑motivational quotes designed to entertain and provoke thought. The system supports:
- **Google Single Sign-On (SSO)** for secure authentication.
- **Recurring subscriptions via Stripe**, enabling a paid version that is ad‑free and receives auto‑generated custom quotes.
- **Custom quote generation via Vertex AI**, with paid members receiving new quotes every 4 minutes (up to 360 per day).
- **Persistent user storage** with Cloud SQL.
- **Robust security** (Helmet, CSRF protection, rate limiting, secure sessions).
- **SEO optimizations** and responsive design with a toggleable accessibility mode.

---

## Features

- **Dark & Moody UI:** A sleek, modern design with a dark color palette.
- **Google SSO Authentication:** Simple and secure login using your Google account.
- **Recurring Subscriptions:** Paid users get an ad‑free experience and access to custom quote generation.
- **Custom Quote Generation:** Paid members receive custom quotes automatically every 4 minutes (up to 360 per day) using Vertex AI.
- **Account Management:** Paid users can cancel their subscription and delete their account directly from the UI.
- **Robust Security:** Helmet, CSRF protection, and rate limiting protect the application.
- **SEO Optimized:** Meta tags for description, keywords, canonical URLs, Open Graph, and Twitter cards.
- **Toggleable Accessibility Mode:** Users can switch to a high‑contrast, accessible view if needed.
- **Extensive Quotes Library:** Over 120 dark humor and anti‑motivational quotes (including phrases like “Watch your face!” and “D*am you're ugly.”).

---

## Prerequisites

Before you begin, ensure you have:

- [Node.js (v14 or later)](https://nodejs.org/)
- A Google Cloud Platform account with billing enabled.
- A Cloud SQL instance (MySQL) configured.
- A Google Cloud Run project.
- Google API credentials for Google SSO.
- Stripe account with subscription settings configured.
- Vertex AI endpoint and API key (if using custom quote generation).

---

## Installation & Local Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/dark-humor-quotes.git
   cd dark-humor-quotes
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **(Optional) Create a `.env` File for Local Development:**

   You can use a package like [dotenv](https://www.npmjs.com/package/dotenv) to load environment variables locally. Create a `.env` file in the root directory with the following keys:

   ```dotenv
   PORT=8080
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASS=your-db-password
   DB_NAME=your-db-name
   YOUR_GOOGLE_CLIENT_ID=your-google-client-id
   YOUR_GOOGLE_CLIENT_SECRET=your-google-client-secret
   VERTEX_AI_ENDPOINT=https://your-vertex-ai-endpoint
   VERTEX_AI_API_KEY=your-vertex-ai-api-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   PRICE_ID=your-stripe-price-id
   NODE_ENV=development
   ```

4. **Run Locally:**

   ```bash
   npm start
   ```

   Open your browser at [http://localhost:8080](http://localhost:8080) to view the application.

---

## Environment Variables

The application relies on several environment variables for configuration:

- **Server & Database:**
  - `PORT`: The port on which the app runs (default: 8080).
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Credentials for your Cloud SQL instance.

- **Google SSO:**
  - `YOUR_GOOGLE_CLIENT_ID`
  - `YOUR_GOOGLE_CLIENT_SECRET`

- **Vertex AI:**
  - `VERTEX_AI_ENDPOINT`
  - `VERTEX_AI_API_KEY`

- **Stripe:**
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `PRICE_ID` (for your subscription plan)

- **Miscellaneous:**
  - `NODE_ENV` (set to `production` in your production environment)

---

## Google Cloud Platform Setup

### Cloud SQL Configuration

1. **Create a Cloud SQL Instance:**
   - Use the GCP Console to create a new Cloud SQL instance (MySQL).
   - Note the connection details (host, user, password, database name).

2. **Configure Connections:**
   - Use the [Cloud SQL Proxy](https://cloud.google.com/sql/docs/mysql/connect-run) or the Cloud SQL Connector if deploying on Cloud Run.
   - Set the appropriate environment variables (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`).

### Cloud Run Deployment

1. **Containerize the App:**
   - Create a `Dockerfile` in your project root. (An example Dockerfile is provided below.)

   ```Dockerfile
   # Use Node.js LTS image
   FROM node:16

   # Create app directory
   WORKDIR /usr/src/app

   # Install app dependencies
   COPY package*.json ./
   RUN npm install --production

   # Bundle app source code
   COPY . .

   # Expose port
   EXPOSE 8080

   # Start the application
   CMD [ "npm", "start" ]
   ```

2. **Deploy to Cloud Run:**
   - Use the gcloud CLI:

     ```bash
     gcloud run deploy dark-humor-quotes \
       --image gcr.io/your-project-id/dark-humor-quotes \
       --platform managed \
       --region your-region \
       --allow-unauthenticated \
       --set-env-vars PORT=8080,DB_HOST=your-db-host,DB_USER=your-db-user,DB_PASS=your-db-pass,DB_NAME=your-db-name,YOUR_GOOGLE_CLIENT_ID=your-google-client-id,YOUR_GOOGLE_CLIENT_SECRET=your-google-client-secret,VERTEX_AI_ENDPOINT=your-vertex-ai-endpoint,VERTEX_AI_API_KEY=your-vertex-ai-api-key,STRIPE_SECRET_KEY=your-stripe-secret-key,STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret,PRICE_ID=your-stripe-price-id,NODE_ENV=production
     ```

3. **Configure Cloud SQL Access:**
   - In Cloud Run, add the Cloud SQL instance connection name under the "Connections" tab or via gcloud using the `--add-cloudsql-instances` flag.

### Google SSO Setup

1. **Create Credentials:**
   - Visit the [Google Cloud Console](https://console.developers.google.com/), create a new project (or select an existing one), and enable the "Google+ API" or "People API".
   - Create OAuth 2.0 credentials, set the authorized redirect URI to `https://your-domain.com/auth/google/callback`.

2. **Update Environment Variables:**
   - Set `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_CLIENT_SECRET` with your credentials.

---

## Stripe Configuration

1. **Set Up a Stripe Account:**
   - Create a Stripe account and set up your subscription product/price.
   - Note your Price ID and secret keys.

2. **Configure Webhooks:**
   - In the Stripe Dashboard, configure a webhook endpoint to point to `https://your-domain.com/subscriptions/webhook`.
   - Set the webhook secret (`STRIPE_WEBHOOK_SECRET`) in your environment.

3. **Update Environment Variables:**
   - Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PRICE_ID`.

---

## Usage

- **Access the Application:**
  - Visit your deployed URL (e.g., `https://dark-humor-quotes-abc123.run.app`).

- **Sign In:**
  - Click "Sign in with Google" to create an account via Google SSO.

- **Upgrade to Paid Membership:**
  - Once signed in, click the "Upgrade" link to simulate payment (or use Stripe's subscription flow via the `/subscriptions/create-subscription` endpoint).
  - Paid members will no longer see ads and will receive custom quotes from Vertex AI every 4 minutes (up to 360 per day).

- **Account Management:**
  - Paid members can cancel their subscription by clicking the "Cancel Subscription" button.
  - They can also delete their account by clicking the "Delete Account" button.

- **Custom Quote Generation:**
  - For paid members, custom quotes are generated automatically every 4 minutes. Manual generation is also available via the "Generate Custom Quote" button.

---

## Account Management

### Cancel Subscription

- **Endpoint:** `POST /cancel-subscription`
- **Function:** Cancels the active Stripe subscription at the period end and updates the user record to mark them as not paying.
- **Usage:** Accessible via the "Cancel Subscription" button on the main page (only visible for paid users).

### Delete Account

- **Endpoint:** `POST /delete-account`
- **Function:** Cancels any active subscription, deletes the user's record from the database, and logs them out.
- **Usage:** Accessible via the "Delete Account" button on the main page (only visible for logged-in users).

---

## Troubleshooting & FAQ

- **MySQL/Cloud SQL Issues:**
  - Ensure that your Cloud SQL instance is running and that your connection details (host, user, password, database) are correct.
  - Verify that Cloud Run has the correct permissions and connection settings to access Cloud SQL.

- **Google SSO Issues:**
  - Ensure that your OAuth credentials are correct and that the authorized redirect URI matches exactly.

- **Stripe Issues:**
  - Verify that your Stripe keys and Price ID are correctly set.
  - Use the Stripe CLI or Dashboard logs to debug webhook events.

- **Vertex AI Integration:**
  - Confirm that your Vertex AI endpoint is reachable and that your API key is valid.
  - Check your logs for any errors related to custom quote generation.

- **Deployment Issues on GCP:**
  - Make sure all environment variables are set in Cloud Run.
  - Review the Cloud Run logs and Cloud SQL connection settings if issues arise.

---

## License

This software is proprietary and is the intellectual property of **Preston West**. All rights are reserved. No part of this software, including the source code and documentation, may be reproduced, distributed, or transmitted in any form or by any means—electronic, mechanical, photocopying, recording, or otherwise—without the prior written permission of **Preston West**.

For permission requests, please contact:  
**Preston West**  
Email: [prestonwest87@gmail.com](mailto:prestonwest87@gmail.com)

### Full Proprietary License Text

```
Copyright (c) [Year] Preston West

All Rights Reserved.

This software and associated documentation files (the "Software") are proprietary
to Preston West and contain confidential information. Unauthorized copying,
reproduction, distribution, or modification of the Software is strictly prohibited.
Any use, disclosure, or distribution of the Software without prior written consent
of Preston West is strictly prohibited.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL PRESTON WEST BE LIABLE FOR ANY CLAIM,
DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE,
ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
```

---

## Contact

For further inquiries, feature requests, or licensing information, please contact:

**Preston West**  
Email: [prestonwest87@gmail.com](mailto:prestonwest87@gmail.com)
