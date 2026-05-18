/**
 * FREEBIE MAXING - MASTER DATA PIPELINE
 * This script orchestrates the entire flow: Scrape -> Clean -> AI Extract -> JSON Output
 */

import { scrapeTermsAndConditions } from './scraper.js';
import { parseFreebieTerms } from './ai_parser.js';

async function runPipeline(targetUrl) {
  console.log(`\n🚀 [Pipeline Started] Target: ${targetUrl}`);
  
  // Step 1: Scrape the raw terms
  console.log("⏳ Fetching and cleaning website text...");
  const rawText = await scrapeTermsAndConditions(targetUrl);
  
  if (!rawText) {
    console.error("❌ Pipeline Aborted: Failed to scrape text.");
    return;
  }

  // Step 2: Feed text to Claude Max
  console.log("🧠 Sending cleaned text to Claude Max for structured extraction...");
  const structuredData = await parseFreebieTerms(rawText);

  if (structuredData) {
    console.log("\n✅ [Pipeline Complete] Final JSON Output:\n");
    console.log(JSON.stringify(structuredData, null, 2));
    
    // In the future, we will add a step here to automatically append this 
    // JSON directly into your frontend database file!
  } else {
    console.error("❌ Pipeline Aborted: AI failed to parse the schema.");
  }
}

// ==========================================
// RUN THE MACHINE
// ==========================================
// Replace this with any local business terms URL you want to test!
const newFreebieUrl = "https://bostonpizza.com/en/mybp.html";

runPipeline(newFreebieUrl);
