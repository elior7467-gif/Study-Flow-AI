# StudyFlow AI

StudyFlow AI is a zero-hallucination learning assistant tailored for JEE & NEET aspirants. It leverages a Dual-AI engine where a Solver AI drafts derivations and solutions, and a Critic AI rigorously fact-checks against standard textbooks line-by-line.

## Features

- **Dual-AI Pipeline**: Drafts step-by-step solutions and verifies them against standard textbooks.
- **Fact-Checked Citations**: Transparent feedback with textbook page references.
- **Interactive Vault**: 3D simulators to visualize complex scientific concepts.

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file based on `.env.example`, or just use the generated `.env` file, and insert your Primary and Secondary AI API Keys.
   ```bash
   PRIMARY_AI_API_KEY="YOUR_PRIMARY_API_KEY_HERE"
   SECONDARY_AI_API_KEY="YOUR_SECONDARY_API_KEY_HERE"
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.
