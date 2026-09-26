import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FuzzySearchFn } from "@/components/ui/AppInputsFuzzyMatch";

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

export const fuzzyMatch: FuzzySearchFn = (query, options) => {
  const q = query.toLowerCase();
  const score = (option: string) => {
    const o = option.toLowerCase();
    if (o.startsWith(q)) return 0;
    if (o.includes(q)) return 1;
    let i = 0;
    for (const char of o) if (char === q[i]) i++;
    return i === q.length ? 2 : -1; // letters in order, gaps allowed
  };
  return options
    .map((option) => ({ option, s: score(option) }))
    .filter(({ s }) => s >= 0)
    .sort((a, b) => a.s - b.s)
    .map(({ option }) => option);
};