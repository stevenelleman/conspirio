import { z } from "zod";

export const cares: string[] = [
  // Emotional care
  "Listening",
  "Validation",
  "Comfort",
  "Encouragement",

  // Practical care
  "Acts of service",
  "Logistical support",
  "Material support",

  // Doing and problem-solving
  "Helping with a task",
  "Fixing what's broken",
  "Taking something off their plate",
  "Researching options",
  "Making a plan together",
  "Brainstorming solutions",
  "Offering advice when asked",
  "Teaching a skill",
  "Connecting them to people or resources",
  "Advocating on their behalf",
  "Following through",
  "Asking whether they want solutions or just support",
  "Letting them solve it themselves",

  // Presence and attention
  "Quality time",
  "Remembering",
  "Showing up",
  "Checking in",

  // Touch
  "Hugs",
  "Holding hands",
  "A hand on the shoulder",
  "Sitting or standing close",
  "Cuddling",
  "Massage",
  "Stroking hair or back",
  "Sexual intimacy",
  "Asking before touching",
  "Saying what touch you like",

  // Creative gifts and handmade comfort
  "Making music or a playlist",
  "Playing or singing for them",
  "Drawing, painting, or other art",
  "Writing a poem, letter, or story",
  "Cooking comfort food",
  "Baking something for them",
  "Making tea or a warm drink",
  "Knitting, sewing, or crafting",
  "Making a photo album or scrapbook",
  "Building or fixing something by hand",
  "Growing or arranging flowers or plants",
  "Making a care package",
  "Creating a ritual or tradition together",
  "Making something with them, not just for them",
  "Receiving a handmade gift warmly",

  // Affection and appreciation
  "Words of affirmation",
  "Gifts and small gestures",
  "Celebration",

  // Honest and respectful care
  "Truth-telling",
  "Respecting boundaries",
  "Supporting autonomy",
  "Accountability",

  // Sustaining care
  "Consistency",
  "Forgiveness and patience",
  "Space",
  "Care for the relationship itself",
] as const;

export const CaresSchema = z.array(z.string());

export type cares = z.infer<typeof CaresSchema>;