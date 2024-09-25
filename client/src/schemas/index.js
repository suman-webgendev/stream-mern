import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export const registerSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const cardSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  postalCode: z.string().min(6, { message: "Postal code is required" }),
  phoneNumber: z
    .string()
    .regex(
      /^(\+?\d{1,3})?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4}$/,
      "Phone number is invalid",
    )
    .min(10, "Phone number must be at least 10 digits long"),
});
