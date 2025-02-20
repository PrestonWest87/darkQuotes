/**
 * app.js
 *
 * Main application file for the Dark Humor Quotes project.
 * Implements Google SSO, Cloud SQL persistence, custom quote generation via Vertex AI,
 * robust logging via Winston, dark humor error handling, a toggleable accessibility mode,
 * and additional security measures (Helmet, CSRF protection, rate limiting, secure cookies).
 *
 * Environment Variables:
 *   - PORT (optional, default 8080)
 *   - DB_HOST, DB_USER, DB_PASS, DB_NAME (for Cloud SQL)
 *   - YOUR_GOOGLE_CLIENT_ID, YOUR_GOOGLE_CLIENT_SECRET (for Google SSO)
 *   - VERTEX_AI_ENDPOINT, VERTEX_AI_API_KEY (for Vertex AI integration)
 *
 * License: Proprietary – All rights reserved by Preston West.
 * Author: Preston West <prestonwest87@gmail.com>
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const csurf = require('csurf');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const db = require('./db'); // Cloud SQL module
const winston = require('winston');

// Setup Winston logger.
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
      new winston.transports.Console()
  ]
});

const app = express();
const port = process.env.PORT || 8080;

// Initialize the database (Cloud SQL)
db.initialize().catch(err => {
  logger.error('Error initializing the database:', err);
  process.exit(1);
});

// ------------------------
// Security Middleware
// ------------------------

// Use Helmet to set secure HTTP headers.
app.use(helmet());

// Rate Limiting - limit to 100 requests per 15 minutes per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// ------------------------
// Session Middleware
// ------------------------
app.use(session({
  secret: 'your-secret-key', // Replace with a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production' // Secure cookies in production
  }
}));

// ------------------------
// Passport Setup for Google SSO
// ------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.google_id);
});
passport.deserializeUser((googleId, done) => {
  db.getUserByGoogleId(googleId)
    .then(user => done(null, user))
    .catch(err => done(err));
});

passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',         // Replace with your Google client ID
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your Google client secret
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db.getUserByGoogleId(profile.id);
      if (user) {
        user.displayName = profile.displayName;
        user.email = profile.emails[0].value;
        user = await db.updateUser(user);
        return done(null, user);
      } else {
        const newUser = {
          google_id: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          isPaying: false,
          dailyCount: 0,
          lastReset: new Date().toISOString()
        };
        user = await db.createUser(newUser);
        return done(null, user);
      }
    } catch (err) {
      logger.error('Error during Google SSO callback:', err);
      return done(err);
    }
  }
));

// ------------------------
// Bot Detection Middleware
// ------------------------
function detectBots(req, res, next) {
  const userAgent = req.get('User-Agent') || '';
  if (/bot|crawl|spider|slurp|crawler/i.test(userAgent) && req.path !== '/robot') {
    logger.info(`Bot detected: ${userAgent}`);
    return res.redirect('/robot');
  }
  next();
}
app.use(detectBots);

// ------------------------
// Express & Body Parsing Setup
// ------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // For parsing JSON bodies in POST requests

// ------------------------
// CSRF Protection Middleware
// ------------------------
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// ------------------------
// Monetization Middleware (Google AdSense compliant)
// ------------------------
function monetizationMiddleware(req, res, next) {
  if (req.user && req.user.isPaying) {
    res.locals.headerAd = '';
    res.locals.footerAd = '';
  } else {
    res.locals.headerAd = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXX"
           data-ad-slot="YYYYYYYYYYYY"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    `;
    res.locals.footerAd = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-XXXXXXXXXXXX"
           data-ad-slot="ZZZZZZZZZZZZ"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    `;
  }
  next();
}
app.use(monetizationMiddleware);

// ------------------------
// Fallback Static Dark Humor Quotes
// ------------------------
const fallbackQuotes = [
  "If life gives you lemons, f*cking squeeze them in the eye of your enemies.",
  "When you're down and out, remember: even your ex has more ambition.",
  "In the chaos of battle, sometimes all you can do is laugh at the absurdity—even if it's grim.",
  "Sometimes being a cop means laughing at the madness while knowing the system's f*cked up.",
  "Firefighters risk it all daily—darn, if you're not living on the edge, what's the point?",
  "If you're stuck in customer service, just remember: your soul is f*cked, but at least you get a paycheck.",
  "Keep going—because if you quit, even the damn vending machine won't give you change.",
  "They say hard work pays off. Well, my bank account's got a wicked sense of humor.",
  "In a world gone mad, sometimes the only sane response is to drop a well-timed f*ck you.",
  "The road to success is paved with failures, and a few choice expletives along the way.",
  "If you're in uniform or behind a desk, remember: your day is as unpredictable as a f*cking storm.",
  "Sometimes, the only way to survive the madness is to laugh at the absurdity of it all."
];

// ------------------------
// API Endpoint for Fallback Paginated Quotes (Optional)
// ------------------------
app.get('/api/quotes', (req, res) => {
  const offset = parseInt(req.query.offset, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 5;
  const paginatedQuotes = fallbackQuotes.slice(offset, offset + limit);
  res.json({ quotes: paginatedQuotes });
});

// ------------------------
// Route: Main Page
// ------------------------
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

// ------------------------
// Route: Robot Page (for detected bot traffic)
// ------------------------
app.get('/robot', (req, res) => {
  res.render('robot');
});

// ------------------------
// Google Authentication Routes
// ------------------------
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => { res.redirect('/'); }
);

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) logger.error('Error during logout:', err);
    res.redirect('/');
  });
});

// ------------------------
// Route: Upgrade to Paid Membership (Simulated Payment)
// ------------------------
app.get('/upgrade', async (req, res) => {
  if (req.user) {
    req.user.isPaying = true;
    req.user.dailyCount = 0;
    req.user.lastReset = new Date().toISOString();
    try {
      req.user = await db.updateUser(req.user);
    } catch (err) {
      logger.error('Error updating user during upgrade:', err);
    }
    res.redirect('/');
  } else {
    res.redirect('/');
  }
});

// ------------------------
// Utility: Check and Reset Daily Count
// ------------------------
/**
 * Resets the daily count if the last reset day is not today.
 * @param {Object} user 
 * @returns {Promise<Object>} Updated user.
 */
function checkDailyLimit(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const now = new Date();
      const lastReset = new Date(user.lastReset);
      if (now.toDateString() !== lastReset.toDateString()) {
        user.dailyCount = 0;
        user.lastReset = now.toISOString();
        user = await db.updateUser(user);
      }
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

// ------------------------
// Route: Generate Custom Quote via Vertex AI (Paid Members Only)
// ------------------------
app.post('/generate-quote', async (req, res, next) => {
  // CSRF token is validated automatically by csurf middleware.
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  if (!req.user.isPaying) {
    return res.status(403).json({ error: 'Upgrade to paid membership to generate custom quotes.' });
  }
  
  try {
    // Check and reset daily count if needed.
    req.user = await checkDailyLimit(req.user);
    if (req.user.dailyCount >= 30) {
      return res.status(429).json({ error: 'Daily generation limit reached. Try again tomorrow.' });
    }
    // Increment daily usage.
    req.user.dailyCount++;
    req.user = await db.updateUser(req.user);
    
    // Call the Vertex AI endpoint.
    const response = await axios.post(process.env.VERTEX_AI_ENDPOINT, {
      prompt: "Generate a dark humor motivational quote with light profanity that may target military, police, firefighters, and customer service."
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VERTEX_AI_API_KEY}`
      }
    });
    // Assume the response contains the generated quote in response.data.quote.
    const generatedQuote = response.data.quote;
    res.json({ quote: generatedQuote });
  } catch (error) {
    logger.error('Error generating quote via Vertex AI:', error);
    next(error);
  }
});

// ------------------------
// Error Handling Middleware
// ------------------------
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(500);
  if (req.accepts('html')) {
    res.render('error', { message: "Well, shit. Even the abyss chuckles at our misfortune! An error has occurred. We're as surprised as you are—please try again later." });
  } else if (req.accepts('json')) {
    res.json({ error: "Our dark side has taken over the server! Please try again later." });
  } else {
    res.type('txt').send("Our dark side has taken over the server! Please try again later.");
  }
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
