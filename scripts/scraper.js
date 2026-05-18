/**
 * FREEBIE MAXING - T&C WEB SCRAPER
 * Architecture Note: This script uses Axios & Cheerio to fetch and parse HTML.
 * Crucially, it strips out <script>, <style>, and <nav> tags to ensure we don't 
 * send garbage tokens to the Claude API, saving bandwidth and compute costs.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

async function scrapeTermsAndConditions(targetUrl) {
  console.log(`[Scraper] Initiating connection to: ${targetUrl}`);

  try {
    // 1. Fetch the HTML with a realistic User-Agent to prevent basic bot-blocking
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000 // 10-second timeout so the pipeline doesn't hang forever
    });

    // 2. Load the HTML into Cheerio for parsing
    const $ = cheerio.load(response.data);

    // 3. DEBUG/OPTIMIZE: Strip out non-content tags to save AI tokens
    $('script, style, noscript, iframe, img, svg, nav, footer, header').remove();

    // 4. Extract the remaining clean text
    // We replace multiple newlines/spaces with a single space for clean formatting
    let cleanText = $('body').text().replace(/\s+/g, ' ').trim();

    if (!cleanText) {
      throw new Error("Target page returned no readable body text.");
    }

    console.log(`[Scraper] Success. Extracted ${cleanText.length} characters of clean text.`);
    
    // Return the text so it can be passed to the ai_parser.js
    return cleanText;

  } catch (error) {
    if (error.response) {
      console.error(`[Scraper Error] Server responded with status code: ${error.response.status}`);
    } else if (error.request) {
      console.error(`[Scraper Error] Network timeout or no response from server.`);
    } else {
      console.error(`[Scraper Error] Parsing failed: ${error.message}`);
    }
    return null; // Return null gracefully so the pipeline doesn't crash
  }
}

// ==========================================
// TEST EXECUTION
// ==========================================
// Let's test it on a public T&C page to ensure the pipeline is solid.
async function runTest() {
  const testUrl = "https://www.redrobin.com/rewards"; // Example Freebie Page
  const scrapedData = await scrapeTermsAndConditions(testUrl);
  
  if (scrapedData) {
     console.log("[Test Output Preview]:\n", scrapedData.substring(0, 500) + "...\n");
  }
}

runTest();
