# Codebase Comprehension & Auditing Rules (Claude & Gemini Compatible)

- **Never Guess Schemas or API Contracts**: Always view the authoritative model/schema file before assuming property names or data types.
- **Trace End-to-End Execution**: When asked how a feature works, trace from the entry point down to database access.
- **Identify Legacy / Dual Implementations**: Active code must be distinguished from dead or stubbed legacy files.
- **Verify Build and Test Health**: Always check package scripts, typechecks (`tsc --noEmit`), and unit test runners before concluding analysis.
