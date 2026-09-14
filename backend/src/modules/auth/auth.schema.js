import { z } from "zod";

const isValidTimeZone = (timezone) => {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone
    });

    return true;
  } catch {
    return false;
  }
};

export const registerSchema = z
  .object({
    email: z.string().email(),

    password: z
      .string()
      .min(8),

    timezone: z
    .string()
    .trim()
    .min(1)
    .refine(isValidTimeZone, {
        message: "Invalid IANA timezone"
    }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),

    password: z
      .string()
      .min(1)
  })
  .strict();