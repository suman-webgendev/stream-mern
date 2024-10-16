"use strict";

import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_APT_BASE_URL,
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

export const formatDate = (uploadDate) => {
  const dateFormat = new Date(uploadDate);
  const now = new Date();

  const years = now.getFullYear() - dateFormat.getFullYear();
  const months = now.getMonth() - dateFormat.getMonth() + years * 12;

  const timeDifference = now.getTime() - dateFormat.getTime();

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(timeDifference / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(timeDifference / (1000 * 60)) % 60;
  const seconds = Math.floor(timeDifference / 1000) % 60;

  if (years >= 1) {
    return `${years} years ago`;
  } else if (months >= 1) {
    if (days >= 30 && days < 60) {
      return `1 month ago`;
    }
    return `${months} months ago`;
  } else if (days >= 1) {
    return `${days} days ago`;
  } else if (hours >= 1) {
    return `${hours} hours ago`;
  } else if (minutes >= 1) {
    return `${minutes} minutes ago`;
  } else {
    return `${seconds} seconds ago`;
  }
};

export const getSender = (currentUser, users) => {
  return users[0]._id === currentUser._id ? users[1].name : users[0].name;
};

export const formatPriceData = (apiResponse) => {
  return apiResponse?.plans
    .map((plan) => {
      const annualPriceObj = plan.prices.find(
        (price) => price.recurring && price.recurring.interval === "year",
      );

      const monthlyPriceObj = plan.prices.find(
        (price) => price.recurring && price.recurring.interval === "month",
      );

      const annualPrice = annualPriceObj ? annualPriceObj.unit_amount / 100 : 0;
      const monthlyPrice = monthlyPriceObj
        ? monthlyPriceObj.unit_amount / 100
        : 0;

      return {
        id: plan.id,
        title: plan.name,
        description: plan.description,
        features: Object.entries(plan.metadata).map(([, value]) => value),
        monthlyPriceId: monthlyPriceObj.id,
        monthlyPrice,
        annualPriceId: annualPriceObj.id,
        annualPrice,
        ...(plan.name === "Premium Plan" && { popular: true }),
      };
    })
    .sort((a, b) => {
      const order = ["Basic Plan", "Standard Plan", "Premium Plan"];
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
};

export const formatAmount = (amount) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateStripeToken = async (
  values,
  elements,
  stripe,
  setError,
  CardNumberElement,
) => {
  try {
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardNumberElement);
    const { error, token } = await stripe.createToken(cardElement, {
      name: values.name,
      address_zip: values.postalCode,
      phone: values.phoneNumber.replace(/\D/g, ""),
    });

    if (!token || error) {
      throw error;
    }
    return token;
  } catch (err) {
    setError(err.message);
  }
};
