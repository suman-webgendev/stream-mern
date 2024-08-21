import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const dataFetch = axios.create({
  baseURL: import.meta.env.APT_BASE_URL,
});
