Below is an example of a comprehensive **README.md** file for your project that uses a restrictive proprietary license. This license explicitly states that the code is your intellectual property and may not be reproduced, distributed, or otherwise used without your permission.

---

```markdown
# Dark Humor Quotes

Dark Humor Quotes is a production‑ready Node.js web application designed to deliver a steady stream of dark humor motivational quotes. This project is proprietary software and is the intellectual property of **[Your Name]**. Use, reproduction, or distribution of any part of this code without explicit written permission is strictly prohibited.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Directory Structure](#directory-structure)
- [License](#license)
- [Contact](#contact)

## Overview

Dark Humor Quotes combines modern web technologies with a sleek, dark, and moody design. The application includes:

- **Google Single Sign-On (SSO)** via Passport.js for secure authentication.
- **Paid Membership Integration:** Upgrading to a paid membership removes ads and enables custom quote generation (up to 30 times per day) powered by Vertex AI.
- **Persistent User Storage:** Uses Cloud SQL (MySQL) on Google Cloud Platform for storing user profiles and usage data.
- **Robust Logging & Error Handling:** Winston is used for logging, and custom, darkly humorous error pages are provided.
- **Toggleable Accessibility Mode:** Users can switch to an accessible high-contrast view if desired.
- **Unobtrusive Ad Placements:** Google AdSense ads are integrated in a minimal, non-distracting manner.

## Features

- **Modern, Dark UI:** A sleek and modern user interface with a dark, moody color scheme.
- **Google SSO Authentication:** Secure, one-click sign in with Google.
- **Custom Quote Generation:** For paying members, generate custom quotes via Vertex AI.
- **Persistent Cloud SQL Storage:** All user data is stored in a managed Cloud SQL instance.
- **Accessibility Options:** Users can toggle an accessibility mode that increases font sizes, contrast, and overall readability.
- **Comprehensive Logging & Error Handling:** Errors are logged via Winston and displayed with a touch of dark humor.
- **Restrictive Proprietary License:** This code is proprietary and not to be reproduced or used without explicit permission.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/dark-humor-quotes.git
   cd dark-humor-quotes
   ```

2. **Install Dependencies:**

   Make sure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

## Configuration

Before running the application, set the following environment variables. These can be configured using a `.env` file (with a tool like [dotenv](https://www.npmjs.com/package/dotenv)) or via your deployment platform (e.g., Cloud Run):

- **Server Port:**
  - `PORT` (optional, defaults to `8080`)

- **Cloud SQL Configuration:**
  - `DB_HOST` – Hostname or Cloud SQL socket path.
  - `DB_USER` – Database user.
  - `DB_PASS` – Database password.
  - `DB_NAME` – Database name.

- **Google SSO Credentials:**
  - `YOUR_GOOGLE_CLIENT_ID` – Your Google OAuth Client ID.
  - `YOUR_GOOGLE_CLIENT_SECRET` – Your Google OAuth Client Secret.

- **Vertex AI Integration:**
  - `VERTEX_AI_ENDPOINT` – URL for your Vertex AI endpoint.
  - `VERTEX_AI_API_KEY` – API key for authenticating to Vertex AI.

Example `.env` file:

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
```

## Usage

- **Start the Application:**

  ```bash
  npm start
  ```

- **Access the Application:**

  Open your browser and navigate to [http://localhost:8080](http://localhost:8080).

- **Key Functionalities:**
  - **Sign In:** Use Google SSO to log in.
  - **Upgrade:** Click the upgrade link to become a paid member for an ad-free experience and custom quote generation.
  - **Toggle Accessibility Mode:** Use the "Toggle Accessibility" button to switch to an accessible, high-contrast view.
  - **Custom Quote Generation:** Paid members can click the "Generate Custom Quote" button to request a quote from Vertex AI (up to 30 times per day).

## Deployment

This application is designed for deployment on Google Cloud Platform (GCP) using Cloud Run. Ensure that your Cloud SQL instance is properly configured and that your Cloud Run service has the necessary access (via the Cloud SQL Proxy or Cloud SQL Connector). Set the required environment variables in your Cloud Run configuration.

## Directory Structure

```
dark-humor-quotes/
├── package.json          # Project metadata and dependencies
├── app.js                # Main application file
├── db.js                 # Cloud SQL database module for user management
├── public/
│   └── style.css         # CSS for dark, moody, modern design with toggleable accessibility
└── views/
    ├── index.ejs         # Main view for the application
    ├── robot.ejs         # View for detected bot traffic
    └── error.ejs         # Error view with dark humor messaging
```

## License

This software is proprietary and is the intellectual property of **[Your Name]**. All rights are reserved. No part of this software, including the source code and documentation, may be reproduced, distributed, or transmitted in any form or by any means—electronic, mechanical, photocopying, recording, or otherwise—without the prior written permission of **[Your Name]**.

For permission requests, please contact:  
**[Your Name]**  
Email: [your.email@example.com]  

### Full Proprietary License Text

```
Copyright (c) [Year] [Your Name]

All Rights Reserved.

This software and associated documentation files (the "Software") are proprietary
to [Your Name] and contain confidential information. Unauthorized copying,
reproduction, distribution, or modification of the Software is strictly prohibited.
Any use, disclosure, or distribution of the Software without prior written consent
of [Your Name] is strictly prohibited.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL [YOUR NAME] BE LIABLE FOR ANY CLAIM,
DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE,
ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
```

## Contact

For further inquiries, feature requests, or licensing information, please contact:

**[Your Name]**  
Email: [your.email@example.com]

---

Happy coding, and remember: this software is for your eyes only—if you see it elsewhere, someone broke the rules!
```

---

Save the above text as `README.md` in your project root. When you add this file to your GitHub repository, commit it along with the rest of your source code. This README provides a full overview of the project, installation instructions, usage details, and a restrictive proprietary license notice that clearly marks the code as your intellectual property.
