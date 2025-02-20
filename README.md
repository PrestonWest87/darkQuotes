# Dark Humor Quotes

**Dark Humor Quotes** is a production‑ready Node.js web application that delivers an endless stream of dark humor and anti‑motivational quotes. The application features:

- **Google SSO Authentication:** Securely log in using your Google account.
- **Recurring Subscriptions via Stripe:** Paid users receive an ad‑free experience with custom quote generation powered by Vertex AI.
- **Custom Quote Generation:** Paid members receive auto‑generated custom quotes every 4 minutes (up to 360 per day).
- **Cloud SQL Persistence:** User data is stored in a managed MySQL database on Google Cloud SQL.
- **Robust Security:** Helmet, CSRF protection, rate limiting, and secure sessions.
- **SEO Optimizations:** Comprehensive meta tags for improved indexing.
- **Toggleable Accessibility Mode:** Users can switch to a high‑contrast, accessible view.
- **Account Management:** Paid users can cancel their subscription and delete their account directly from the UI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [Deploying via the Google Cloud Console (GUI)](#deploying-via-the-google-cloud-console-gui)
  - [Cloud SQL Setup](#cloud-sql-setup)
  - [Building and Uploading the Container Image](#building-and-uploading-the-container-image)
  - [Deploying on Cloud Run](#deploying-on-cloud-run)
  - [Configuring Environment Variables](#configuring-environment-variables)
- [Google SSO Setup](#google-sso-setup)
- [Stripe Setup](#stripe-setup)
- [Usage](#usage)
- [Account Management](#account-management)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [License](#license)
- [Contact](#contact)

---

## Overview

**Dark Humor Quotes** offers a unique blend of dark humor and anti‑motivational quotes. The app uses modern web technologies and is deployed on Google Cloud Platform (GCP) via Cloud Run and Cloud SQL. Paid users benefit from an ad‑free interface with periodic custom quote generation (powered by Vertex AI), while non‑paid users see unobtrusive ads.

---

## Features

- **Modern, Dark UI:** A sleek design with a dark, moody color palette.
- **Google SSO Authentication:** Secure sign‑in using your Google account.
- **Recurring Subscriptions:** Manage subscriptions with Stripe.
- **Custom Quote Generation:** Paid users get quotes automatically every 4 minutes.
- **Persistent Data:** User profiles stored in Cloud SQL.
- **Security Best Practices:** Helmet, CSRF protection, rate limiting, and secure cookies.
- **SEO Optimized:** Comprehensive meta tags for search engine visibility.
- **Toggleable Accessibility:** Option to switch to a high‑contrast, accessible view.
- **Account Management:** Easily cancel your subscription or delete your account.

---

## Prerequisites

- A [Google Cloud Platform](https://cloud.google.com/) account with billing enabled.
- A Cloud SQL instance (MySQL) configured.
- A project in Cloud Run.
- Google API credentials for Google SSO.
- A Stripe account with subscription products set up.
- A Vertex AI endpoint and API key (if using custom quote generation).

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

3. **(Optional) Create a `.env` File:**

   Use a package like [dotenv](https://www.npmjs.com/package/dotenv) to load environment variables locally. Example:

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

   Visit [http://localhost:8080](http://localhost:8080) to test the application.

---

## Environment Variables

The application requires several environment variables:

- **Server & Database:**
  - `PORT`: Port number (default 8080).
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Cloud SQL connection details.

- **Google SSO:**
  - `YOUR_GOOGLE_CLIENT_ID`
  - `YOUR_GOOGLE_CLIENT_SECRET`

- **Vertex AI:**
  - `VERTEX_AI_ENDPOINT`
  - `VERTEX_AI_API_KEY`

- **Stripe:**
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `PRICE_ID`

- **Misc:**
  - `NODE_ENV`: Set to `production` when deploying.

---

## Deploying via the Google Cloud Console (GUI)

This guide explains how to deploy the application using the GCP Console (GUI) instead of the CLI.

### Cloud SQL Setup

1. **Create a Cloud SQL Instance:**
   - In the [Google Cloud Console](https://console.cloud.google.com/), navigate to **SQL**.
   - Click **Create Instance** and select **MySQL**.
   - Configure instance settings (version, region, etc.) and note the connection details (instance connection name, IP address, etc.).

2. **Configure the Database:**
   - Once the instance is ready, create a new database (e.g., `darkhumor`).
   - Set up a database user with a secure password.

### Building and Uploading the Container Image

1. **Containerize the App Using a Dockerfile:**
   Create a `Dockerfile` in your project root:

   ```Dockerfile
   # Use the Node.js LTS image
   FROM node:16

   # Create and set the working directory
   WORKDIR /usr/src/app

   # Copy package files and install dependencies
   COPY package*.json ./
   RUN npm install --production

   # Copy the rest of the application source code
   COPY . .

   # Expose port 8080
   EXPOSE 8080

   # Start the application
   CMD [ "npm", "start" ]
   ```

2. **Build the Container Image:**
   - Use Cloud Build from the Google Cloud Console:
     - Navigate to **Cloud Build**.
     - Click **Triggers** and then **Create Trigger**.
     - Connect your repository and set up a trigger for building your Docker image.
     - Alternatively, you can manually build the image via the Console's Cloud Shell.

3. **Upload the Container Image:**
   - Once built, the image will be stored in Google Container Registry (GCR) or Artifact Registry.
   - Note the image URI (e.g., `gcr.io/your-project-id/dark-humor-quotes`).

### Deploying on Cloud Run

1. **Deploy the Service:**
   - In the GCP Console, navigate to **Cloud Run**.
   - Click **Create Service**.
   - Select the container image built in the previous step.
   - Configure the service:
     - **Service Name:** dark-humor-quotes
     - **Region:** Choose your desired region.
     - **Authentication:** Allow unauthenticated invocations (if required).
   - Under **Advanced Settings**, click **Variables & Secrets**.
     - Add all necessary environment variables (PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME, YOUR_GOOGLE_CLIENT_ID, YOUR_GOOGLE_CLIENT_SECRET, VERTEX_AI_ENDPOINT, VERTEX_AI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRICE_ID, NODE_ENV=production).
   - Under **Connections**, add your Cloud SQL instance connection:
     - Click **Add Connection** and select your Cloud SQL instance.
   - Click **Create** to deploy the service.

2. **Verify Deployment:**
   - Once deployed, access your service URL (provided by Cloud Run) to test the application.

### Google SSO Setup

1. **Create OAuth Credentials:**
   - Go to the [Google Cloud Console API & Services Credentials page](https://console.cloud.google.com/apis/credentials).
   - Create OAuth 2.0 credentials and set the **Authorized redirect URI** to `https://<your-cloud-run-service-url>/auth/google/callback`.

2. **Configure in Cloud Run:**
   - In the Cloud Run service settings, add `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_CLIENT_SECRET` to the environment variables.

### Stripe Setup

1. **Stripe Account & Subscription Setup:**
   - Log in to your [Stripe Dashboard](https://dashboard.stripe.com/).
   - Create a product and subscription plan; note the Price ID.
   - Retrieve your secret key and webhook secret.

2. **Configure in Cloud Run:**
   - In the Cloud Run service settings, add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PRICE_ID` to the environment variables.
   - Set up a webhook endpoint in the Stripe Dashboard pointing to `https://<your-cloud-run-service-url>/subscriptions/webhook`.

---

## Usage

- **Access the Application:**
  - Visit the Cloud Run URL provided by GCP (e.g., `https://dark-humor-quotes-<unique-id>.run.app`).

- **Sign In:**
  - Click **Sign in with Google** to authenticate using your Google account.

- **Upgrade to Paid Membership:**
  - After signing in, click the **Upgrade** link (or use the Stripe subscription flow via `/subscriptions/create-subscription`) to become a paid member.
  - Paid members enjoy an ad‑free experience and receive custom quotes every 4 minutes (up to 360 per day).

- **Account Management:**
  - Paid users have buttons to **Cancel Subscription** and **Delete Account**. Use these to manage your subscription or delete your account.

- **Custom Quote Generation:**
  - Paid members see custom quotes generated via Vertex AI. Quotes are generated automatically every 4 minutes, and you can also manually trigger quote generation.

---

## Account Management

### Cancel Subscription

- **Endpoint:** `POST /cancel-subscription`
- **Function:** Cancels the active Stripe subscription (scheduled to cancel at period end) and updates the user record to mark them as not paying.
- **Access:** Available via the **Cancel Subscription** button on the main page (visible only to paid users).

### Delete Account

- **Endpoint:** `POST /delete-account`
- **Function:** Cancels any active subscription, deletes the user's record from the database, and logs the user out.
- **Access:** Available via the **Delete Account** button on the main page (visible only to logged-in users).

---

## Troubleshooting & FAQ

- **Database Issues:**
  - Verify that your Cloud SQL instance is running and that your connection details are correct.
  - Check that your Cloud Run service is correctly connected to Cloud SQL via the GUI settings.

- **Google SSO Issues:**
  - Ensure that your OAuth credentials are correct and that the authorized redirect URI matches your Cloud Run URL exactly.

- **Stripe Issues:**
  - Double-check that your Stripe keys and Price ID are set in the environment variables.
  - Use the Stripe Dashboard to monitor webhook events and debug subscription issues.

- **Vertex AI Issues:**
  - Confirm that your Vertex AI endpoint is active and that your API key is valid.
  - Check Cloud Run logs for any errors during custom quote generation.

- **Deployment Issues:**
  - Review the Cloud Run and Cloud SQL connection settings in the GCP Console.
  - Verify that all required environment variables are set in the Cloud Run service configuration.

---

## License

This software is proprietary and is the intellectual property of **Preston West**. All rights are reserved. No part of this software, including the source code and documentation, may be reproduced, distributed, or transmitted in any form or by any means—electronic, mechanical, photocopying, recording, or otherwise—without the prior written permission of **Preston West**.

For permission requests, please contact:  
**Preston West**  
Email: [prestonwest87@gmail.com](mailto:prestonwest87@gmail.com)

### Full Proprietary License Text

```
Copyright (c) 2025 Preston West

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

---
