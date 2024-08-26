import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

export const formatDuration = (time) => {
  const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });
  const sec = Math.floor(time % 60);
  const min = Math.floor((time / 60) % 60);
  const hr = Math.floor(time / 3600);
  if (hr === 0) {
    return `${min}:${leadingZeroFormatter.format(sec)}`;
  } else {
    return `${hr}:${leadingZeroFormatter.format(
      min,
    )}:${leadingZeroFormatter.format(sec)}`;
  }
};
