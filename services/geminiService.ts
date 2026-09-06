const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || "/api/ai/outfit";

/**
 * Sends the image to a trusted server-side proxy for outfit editing.
 * Provider credentials must remain on the server and must never be compiled into this browser bundle.
 */
export const generateOutfitChange = async (
  imageBase64: string,
  prompt: string,
  allowNSFW: boolean = false
): Promise<string> => {
  const response = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      image: imageBase64,
      prompt,
      sensitiveContentRequested: allowNSFW,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error || `AI proxy request failed with HTTP ${response.status}`);
  }

  const result = await response.json();
  if (typeof result.imageDataUrl === "string" && result.imageDataUrl.startsWith("data:image/")) {
    return result.imageDataUrl;
  }
  if (typeof result.imageBase64 === "string" && result.imageBase64) {
    return `data:image/png;base64,${result.imageBase64}`;
  }
  throw new Error("The AI proxy returned no image.");
};
