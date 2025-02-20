<!--
  index.ejs
  Main page for Dark Humor Quotes project.
  Displays auto‑rotating fallback quotes, Google AdSense ad units (if non‑paying),
  and provides Google SSO links and upgrade/custom quote generation options.
  
  License: Apache-2.0
  Author: Your Name <your.email@example.com>
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dark Humor Motivational Quotes</title>
  <link rel="stylesheet" href="/style.css">
  <!-- Google AdSense script required by Google -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</head>
<body>
  <div class="container">
    <header>
      <h1>Dark Humor Motivational Quotes</h1>
      <% if (user) { %>
        <p>Welcome, <%= user.displayName %>! (<a href="/logout">Logout</a>)</p>
        <% if (!user.isPaying) { %>
          <p><a href="/upgrade">Upgrade to Ad-Free &amp; Custom Quote Generation</a></p>
        <% } else { %>
          <p>Thank you for being a paying member! Enjoy your ad-free experience.</p>
          <p>Custom Quote Generations Today: <%= user.dailyCount %> / 30</p>
          <button id="generate-btn">Generate Custom Quote</button>
          <div id="custom-quote"></div>
        <% } %>
      <% } else { %>
        <p><a href="/auth/google">Sign in with Google</a></p>
      <% } %>
      <div class="ad-container">
        <%- headerAd %>
      </div>
    </header>
    <main>
      <div id="quote-display" class="quote"></div>
    </main>
    <footer>
      <div class="ad-container">
        <%- footerAd %>
      </div>
      <p>&copy; 2025 Dark Humor Quotes</p>
    </footer>
  </div>
  <script>
    // Auto-rotating fallback quotes with fade transitions.
    let quotesQueue = [];
    let currentIndex = 0;
    let offset = 0;
    const limit = 10;
    const display = document.getElementById('quote-display');

    async function fetchQuotes() {
      try {
        const response = await fetch(`/api/quotes?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        if (data.quotes && data.quotes.length > 0) {
          quotesQueue = quotesQueue.concat(data.quotes);
          offset += limit;
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    }

    function updateQuote() {
      if (quotesQueue.length === 0) return;
      const newQuote = quotesQueue[currentIndex];
      display.classList.add('fade-out');
      setTimeout(() => {
        display.textContent = newQuote;
        display.classList.remove('fade-out');
        display.classList.add('fade-in');
        setTimeout(() => {
          display.classList.remove('fade-in');
        }, 1000);
        currentIndex = (currentIndex + 1) % quotesQueue.length;
        if (currentIndex >= quotesQueue.length - 2) {
          fetchQuotes();
        }
      }, 1000);
    }

    fetchQuotes().then(() => {
      if (quotesQueue.length > 0) {
        display.textContent = quotesQueue[currentIndex];
        currentIndex++;
      }
      setInterval(updateQuote, 90000);
    });

    // For paid members: Custom quote generation.
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        generateBtn.disabled = true;
        try {
          const response = await fetch('/generate-quote', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
          const data = await response.json();
          const customQuoteElem = document.getElementById('custom-quote');
          if (data.quote) {
            customQuoteElem.textContent = data.quote;
          } else if (data.error) {
            customQuoteElem.textContent = data.error;
          }
        } catch (error) {
          document.getElementById('custom-quote').textContent = 'Error generating quote.';
        }
        generateBtn.disabled = false;
      });
    }
  </script>
</body>
</html>
