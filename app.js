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
    secure: process.env.NODE_ENV === 'production'
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
app.use(express.json());

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
  "Sometimes, the only way to survive the madness is to laugh at the absurdity of it all.",
  "Watch your face!",
  "D*am you're ugly.",
  "Success is overrated; failure is the true teacher.",
  "Why try when you can just complain?",
  "Dreams are for the weak; reality bites.",
  "Ambition? More like a desperate plea for validation.",
  "Remember, mediocrity is your destiny.",
  "Stop chasing success—it's a scam.",
  "Optimism is just a delusion for the desperate; embrace your dark side.",
  "The mirror never lies—so stop pretending you're the hero.",
  "Every day is a dumpster fire, so light it up with your cynicism.",
  "Hope is the first step toward disappointment.",
  "Ambition is overrated—why not just sleep through your problems?",
  "Hustle until your enemies see you and then laugh at them.",
  "Hard work may pay off someday, but mediocrity is a guaranteed paycheck.",
  "Failure isn't fatal; it's just a reminder that success is a myth.",
  "Your dreams are nothing but illusions—embrace reality's harsh truth.",
  "Perseverance is just stubbornness with a fancy name.",
  "Don't aim for the stars; you'll just crash into space debris.",
  "Every accomplishment starts with the decision to stop caring.",
  "Life is a cruel joke, and you're the punchline.",
  "Don't let success go to your head—it might explode.",
  "Every silver lining has a dark cloud.",
  "Your life is a series of disappointments strung together with hope.",
  "Be yourself, because everyone else is already over it.",
  "When life knocks you down, roll over and keep dreaming.",
  "Success is just failure with a fancy filter.",
  "Don't aspire to be the best—aspire to be unapologetically mediocre.",
  "The only thing constant in life is pain.",
  "Your destiny is to be forgotten, so why make a fuss?",
  "Dream big, then wake up and face the harsh truth.",
  "Failure is not the opposite of success—it's all you ever get.",
  "Celebrate your small victories, because the big ones are lies.",
  "The secret to happiness is realizing it's a myth.",
  "Every sunrise is a reminder that time is running out.",
  "Believe in yourself? That's a dangerous idea.",
  "Ambition is the enemy of contentment.",
  "Rise and shine? More like fumble and whine.",
  "Your potential is as wasted as your time.",
  "Don't let anyone tell you that life isn't a dumpster fire.",
  "Sometimes the best motivation is a good dose of apathy.",
  "Hard work never killed anyone, but why take the risk?",
  "The path to success is paved with broken dreams.",
  "Let your failures inspire you—to quit altogether.",
  "Never give up—unless you're tired, then just give in.",
  "Your goals are overrated; embrace the chaos.",
  "There’s no reward for trying hard when the system’s rigged.",
  "Push yourself to the limit—only to find out it doesn't matter.",
  "Persevere, they said; you'll only be disappointed further.",
  "If you can’t be the best, settle for the worst.",
  "Your drive to succeed is as futile as a broken clock.",
  "Don't just chase your dreams—run away from them.",
  "Why bother with ambition when contentment is a distant fantasy?",
  "Every victory is a prelude to inevitable failure.",
  "Optimism is a luxury for those who can afford to be naive.",
  "Keep your head up; you'll still end up on the ground.",
  "Every step forward is just another step closer to nowhere.",
  "The brighter you shine, the harder it is for the darkness to swallow you—too bad darkness is everywhere.",
  "Life's a battle, and you're losing without even trying.",
  "Victory is sweet, but its aftertaste is bitter.",
  "Embrace your flaws; perfection is a myth, and so is happiness.",
  "Why reach for the stars when you can be crushed by gravity?",
  "There's no point in striving when failure is guaranteed.",
  "Keep your expectations low and your cynicism high.",
  "The only thing you're destined for is a series of letdowns.",
  "A positive mindset is just sugar-coating life's bitterness.",
  "Strive for greatness, then realize it's all for nothing.",
  "Your journey to success is a comedy of errors.",
  "Don't look for the silver lining; it’s all dark clouds.",
  "They say you should follow your dreams, but your nightmares are more honest.",
  "Ambition is a double-edged sword—mostly dull and dangerous.",
  "In the game of life, everyone’s a loser.",
  "Your efforts are as effective as shouting into the void.",
  "The truth is, success is nothing more than an illusion.",
  "Every plan you make is doomed to fail eventually.",
  "Keep smiling; it distracts from the inevitable collapse.",
  "Hope is the first casualty of ambition.",
  "The higher you climb, the harder you fall.",
  "When all else fails, laugh at the absurdity of it all.",
  "Chase your dreams? More like chase your disappointments.",
  "In the theater of life, you're the tragic clown.",
  "Keep fighting—it's the only way to lose with style.",
  "The light at the end of the tunnel is just the oncoming train.",
  "Success is a mirage; your thirst for it only leaves you parched.",
  "Your best efforts are just a prelude to mediocrity.",
  "Even when you win, you lose—because nothing lasts forever.",
  "Every victory is hollow when reality is so brutal.",
  "Strive for excellence, then realize it's all for nothing.",
  "Your ambition is as empty as your promises.",
  "No matter how hard you try, the universe laughs at you.",
  "Keep pushing forward; the world will eventually push back.",
  "Your determination is admirable, if only it could change your fate.",
  "Aim high—if you miss, you'll still fall spectacularly.",
  "Hard work is noble, but procrastination is honest.",
  "Your persistence only makes the inevitable failure more dramatic.",
  "In the end, all your struggles are just a cosmic joke.",
  "Every ounce of effort is swallowed by the void of futility.",
  "Stay motivated—until the day your hopes turn to dust.",
  "At the end of the day, even success is a bitter pill to swallow.",
  "Fighting against destiny is a game you'll always lose.",
  "The pursuit of greatness is a fool's errand, destined to fail.",
  "Better to embrace the darkness than pretend there's light.",
  "In a world of cynics, your optimism is just another joke."
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
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }
  if (!req.user.isPaying) {
    return res.status(403).json({ error: 'Upgrade to paid membership to generate custom quotes.' });
  }
  
  try {
    // Check and reset daily count if needed.
    req.user = await checkDailyLimit(req.user);
    if (req.user.dailyCount >= 360) {
      return res.status(429).json({ error: 'Daily generation limit reached. Try again tomorrow.' });
    }
    req.user.dailyCount++;
    req.user = await db.updateUser(req.user);
    
    // Call the Vertex AI endpoint.
    const response = await axios.post(process.env.VERTEX_AI_ENDPOINT, {
      prompt: "Generate a dark humor motivational quote with light profanity that may target military, police, firefighters, and customer service. Include anti-motivational phrases such as 'Watch your face!' and 'D*am you're ugly.'"
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VERTEX_AI_API_KEY}`
      }
    });
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
