/**
 * FREEBIE MAXING - AI DATA PIPELINE PROTOTYPE
 * This script is designed to take raw, unstructured Terms & Conditions from business websites
 * and use Claude to extract and format the data into our exact JSON schema.
 */

import { Anthropic } from '@anthropic-ai/sdk';
import fs from 'fs';

// Initialize the Anthropic client (Requires API key from the Max plan)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, 
});

// The strict JSON schema required by our frontend
const EXPECTED_SCHEMA = `{
  "id": "string (kebab-case)",
  "business": "string",
  "domain": "string",
  "category": "food | coffee_dessert | beauty | retail | experience | fitness",
  "perk": "string",
  "scope": "national | bc_local | metro_van | sea_to_sky",
  "municipalities": ["array of strings"],
  "signupRequired": boolean,
  "signupDeadlineDaysBefore": number or null,
  "signupUrl": "string or null",
  "websiteUrl": "string",
  "redemptionWindow": "string (e.g., 'Birthday month', 'Birthday only')",
  "proofRequired": "id | loyalty_account | id_and_account | none",
  "notes": "string (Keep it editorial, concise, and highlight hidden catches)"
}`;

async function parseFreebieTerms(rawText) {
  console.log("Analyzing Terms and Conditions...");

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // Targeting the Max plan tier model
      max_tokens: 1024,
      system: `You are an expert data extraction assistant for an open-source project called Freebie Maxing. 
               Your job is to read messy, corporate Terms and Conditions and extract the core birthday perk details.
               You must return ONLY a valid, minified JSON object matching the provided schema. Do not include markdown formatting or conversational text.`,
      messages: [
        {
          role: "user",
          content: `Extract the birthday perk data from this text and return it matching this schema: ${EXPECTED_SCHEMA}\n\nRAW TEXT:\n${rawText}`
        }
      ]
    });

    const parsedData = JSON.parse(msg.content[0].text);
    console.log("Successfully parsed:", parsedData.business);
    
    // In production, this will append to our database/JSON file
    return parsedData;

  } catch (error) {
    console.error("AI Parsing Failed:", error);
  }
}

// Example Execution (To be wired up to a web scraper in V2)
const dummyScrapedText = `
  Join the Ultimate Burger Club today! Members get a free classic smashburger on their birthday. 
  You must sign up at least 24 hours before your big day to be eligible. The coupon will be loaded 
  onto your app and is valid for 7 days after your birthday. Bring your ID just in case! 
  Available at all Metro Vancouver locations.
`;

// parseFreebieTerms(dummyScrapedText);
