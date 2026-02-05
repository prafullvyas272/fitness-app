import { z } from "zod";

// Slot schema: { start: "HH:mm", end: "HH:mm" }
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const slotSchema = z.object({
  start: z.string().regex(timeRegex, { message: "Start time must be in HH:mm format" }),
  end: z.string().regex(timeRegex, { message: "End time must be in HH:mm format" }),
}).refine(
  (slot) => {
    // compare time strings: "09:00" < "18:00"
    return slot.start < slot.end;
  },
  { message: "Slot 'end' time must be after 'start' time", path: ["end"] }
);

export const userAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" }),
  isAvailable: z.boolean(),
  peakSlots: z
    .array(slotSchema)
    .optional()
    .default([]),
  alternativeSlots: z
    .array(slotSchema)
    .optional()
    .default([]),
}).superRefine((data, ctx) => {
    if (data.isAvailable === true) {
      if (!data.peakSlots || data.peakSlots.length === 0) {
        ctx.addIssue({
          path: ["peakSlots"],
          code: z.ZodIssueCode.custom,
          message: "At least one Peak slot is required when availability is enabled.",
        });
      }
    }
    // When isAvailable is false, no slot requirements.
  });
  
