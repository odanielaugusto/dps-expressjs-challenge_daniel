# 🤖 AI Usage & Engineering Report

## 🔍 Overview
Transparency is key. This project was built using a **"Human-in-the-Loop"** workflow. I acted as the Lead Architect, defining the constraints, schema, and logic, while using AI (Cursor/Claude 3.5 & Gemini) to handle boilerplate code and test generation.

Below is the detailed log of the interactions, prompts used, and manual interventions.

## 🛠️ Workflow & Prompt Engineering

### 1. Database Engineering (Schema Extraction)
Instead of manually writing SQL, I designed the ERD visually to ensure relationships were correct (especially the `Participants` junction table). I then used a specific prompt to convert the visual concept into technical specs.

* **Intent:** Extract SQL constraints from a logical diagram.
* **Prompt Used:**
  > "Act as a Senior Database Architect. I am attaching the ERD I designed... Please generate a structured Schema Description containing Table List, Columns and Types (adapted for SQLite), and Relationships. Note that the `Match` table has separate `scoreA` and `scoreB` columns."
* **Result:** The AI generated the schema used in `src/scripts/init-db.ts`, correctly applying `CHECK` constraints for enums and `UNIQUE` constraints.

### 2. Business Logic (The Round-Robin Algorithm)
I defined the algorithmic requirements and asked the AI to implement the specific logic within the Service layer.

* **Intent:** Implement the matchmaking logic without external libraries.
* **Prompt Used:**
  > "Implement `startTournament` method. It must check for minimum 2 players. Then, implement the Round-Robin algorithm using a double-loop approach to generate all `Match` records (n*(n-1)/2) strictly once."
* **Manual Intervention:** I reviewed the generated code to ensure the nested loop correctly avoided duplicate matches (e.g., A vs B and B vs A) by starting the inner loop at `i + 1`.

### 3. Automated Testing (E2E)
To avoid manual cURL testing, I prompted the AI to build a self-contained test script.

* **Prompt Used:**
  > "Create a new file `src/scripts/test-e2e.ts`. Use Node.js native `fetch`. Simulation Flow: Create Tournament -> Add 3 Players -> Start -> Play Matches -> Check Leaderboard. At the end, verify the math of the points."

## ⚠️ Manual Modifications & Refactoring
AI is not perfect. Here are the specific areas where I intervened:

1. **Architecture Decision:** The AI initially suggested using Prisma (ORM). I **rejected** this suggestion to stick to the challenge's requested `db.service.ts` template and demonstrate proficiency with Raw SQL and the Repository Pattern.
2. **Type Safety:** The AI generated generic `any` types in the controllers. I manually reviewed the interfaces in `src/models/types.ts` to ensure strict typing across the application.
3. **Repository Pattern:** I forced the separation between `Repository` and `Service` layers (which the AI initially blurred) to ensure the code remains testable and scalable.

## 🔗 Conversation Logs
*Note: Since I used Cursor IDE (inline chat), direct links are not available, but the prompts above reflect the exact instructions given.*