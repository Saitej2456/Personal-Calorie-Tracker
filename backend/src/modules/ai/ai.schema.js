import { z } from "zod";

export const extractNutritionSchema = z
  .object({
    /*
     * Base64-encoded image data (without the data URI prefix).
     * The frontend strips "data:image/...;base64," before sending.
     */
    imageData: z.string().min(1),

    /*
     * MIME type of the image. Gemini supports these four.
     */
    mimeType: z.enum([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic"
    ])
  })
  .strict();
