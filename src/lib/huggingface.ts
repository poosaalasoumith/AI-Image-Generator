export async function generateImage(prompt: string, style?: string, seed?: number): Promise<ArrayBuffer> {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY?.trim();
  const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL?.trim();

  console.log("HF MODEL:", HUGGINGFACE_MODEL);

  if (!HUGGINGFACE_API_KEY || !HUGGINGFACE_MODEL) {
    throw new Error("Missing Hugging Face configuration.");
  }

  let fullPrompt = style && style !== "none" ? `${prompt}, ${style} style, high quality, highly detailed` : prompt;
  
  if (seed !== undefined) {
    // Appending an invisible variation suffix helps defeat aggressive caching
    fullPrompt += `, creative variation ${seed}`;
  }
  
  const endpoint = `https://router.huggingface.co/hf-inference/models/${HUGGINGFACE_MODEL}`;
  
  console.log("HF URL:", endpoint);

  const maxRetries = 5;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const requestBody: any = { inputs: fullPrompt };
      if (seed !== undefined) {
        requestBody.parameters = { seed };
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = null;
        }

        console.error(`[Hugging Face API Error] Status: ${response.status} | Endpoint: ${endpoint}`);
        console.error(`[Hugging Face API Error] Full Response:`, errorText);
        
        // Handle model loading error with exponential backoff
        if (response.status === 503) {
          console.log(`Model is loading. Retrying in ${delay / 1000}s (Attempt ${attempt}/${maxRetries})...`);
          if (attempt === maxRetries) {
            throw new Error("Model is taking too long to load. Please try again later.");
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }

        throw new Error(errorData?.error || `Hugging Face API returned status ${response.status}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error("Image generation timed out. The model might be overloaded.");
      }
      
      if (attempt === maxRetries || error.message !== "fetch failed") {
         throw error;
      }
      
      console.warn(`Network error on attempt ${attempt}. Retrying...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Failed to generate image after multiple attempts.");
}
