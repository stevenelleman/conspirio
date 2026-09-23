import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateEmail(inputString: string) {
  // A standard, robust regex pattern for basic validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(inputString);
}

export function validateHttpsDomain(inputString: string) {
  try {
    // The URL constructor throws an error if the string is not a valid URL
    const url = new URL(inputString);

    // Explicitly enforce that the protocol is exactly 'https:'
    return url.protocol === 'https:';
  } catch (error) {
    // If an error is caught, the input string was not a valid absolute URL
    throw(error);
  }
}