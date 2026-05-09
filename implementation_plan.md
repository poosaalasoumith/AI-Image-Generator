# Hugging Face API Migration Plan

This plan details the steps required to completely replace any existing image generation logic with a robust Hugging Face Inference API integration, fulfilling all your requirements.

## Open Questions

- Does the application need to support loading multiple Hugging Face models dynamically, or is relying strictly on `process.env.HUGGINGFACE_MODEL` sufficient for now?

## Proposed Changes

### Configuration and Reusable Helpers
#### [NEW] `src/lib/huggingface.ts`
We will create a robust helper module dedicated to handling all interactions with the Hugging Face Inference API.
- Implements `generateImage(prompt: string, style?: string)`.
- Intelligently combines the prompt and style strings (e.g. "astronaut riding horse, cinematic lighting, realistic").
- Retrieves API endpoint URL using `process.env.HUGGINGFACE_MODEL` and authenticates using `process.env.HUGGINGFACE_API_KEY`.
- Correctly parses binary image response (`arrayBuffer`) and converts it to a standard base64 data URI format (`data:image/jpeg;base64,...`) suitable for UI rendering.
- Implements resilient error handling for edge cases such as timeout issues, invalid tokens, model loading states (503), and rate limit enforcement.

---

### Backend Logic and Server Actions
#### [MODIFY] `src/actions/generate.ts`
We will refactor the existing server action to consume the newly created `src/lib/huggingface.ts` helper and ensure strict business rules apply.
- Ensure 0 remaining credits block generation for free-tier users.
- Connect the action to Prisma to debit exactly `1` user credit upon a *successful* response.
- Automatically save the prompt, style, and generated base64 image URL to the database.
- Completely strip any traces of previously used logic, OpenAI setups, or hardcoded API models.

---

### Verification Plan

### Automated Tests
- N/A (Assuming unit tests are out of scope for this task).

### Manual Verification
1. Run `npm run dev`.
2. Ensure you have less than 5 credits, or are a free user.
3. Access the `/dashboard/generate` page.
4. Input a prompt (e.g., "A golden retriever in space") and select a style ("Realistic").
5. Click **Generate Image** (loading state must appear).
6. Verify the resulting image successfully displays inside the result card.
7. Navigate to the `/dashboard/history` page to confirm the newly generated image displays there properly.
8. Verify that 1 credit was correctly deducted from the database.
