"use strict";

import { db } from "@/db";

export const getUsers = () => db.User.find().sort([["createdAt", -1]]);

export const getUserById = (id) => db.User.findById(id);

export const getUserByEmail = (email) => db.User.findOne({ email });

/**
 * Description
 * @param {string} sessionToken
 * @returns {Promise<db.User>}
 */
export const getUserBySessionToken = (sessionToken) =>
  db.User.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const createUser = (values) =>
  new db.User(values).save().then((user) => user.toObject());

export const getUserByStripeCustomerId = (stripeCustomerId) =>
  db.User.findOne({ stripeCustomerId: stripeCustomerId });
