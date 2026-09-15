import { apiRequest } from "../../api/client"

/**
 * Send a base64-encoded image to the backend for AI nutrition extraction.
 *
 * @param {string} imageData  - Base64 image data (WITHOUT the data URI prefix)
 * @param {string} mimeType   - e.g. "image/jpeg"
 * @param {string} accessToken
 */
export const extractNutrition = (imageData, mimeType, accessToken) => {
  return apiRequest(
    "/ai/extract-nutrition",
    {
      method: "POST",
      body: JSON.stringify({ imageData, mimeType }),
      accessToken,
    }
  )
}

/**
 * Send a chat message to the AI assistant.
 *
 * @param {string} message - The user's message
 * @param {Array} history - The chat history array
 * @param {string} accessToken
 */
export const chatWithAi = (message, history, accessToken) => {
  return apiRequest(
    "/ai/chat",
    {
      method: "POST",
      body: JSON.stringify({ message, history }),
      accessToken,
    }
  )
}
