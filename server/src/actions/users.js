import { db } from "../db/index.js";

export const getUsers = () => db.User.find().sort([["createdAt", -1]]);

export const getUserById = (id) => db.User.findById(id);

export const getUserByEmail = (email) => db.User.findOne({ email });

export const getUserBySessionToken = (sessionToken) =>
  db.User.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const createUser = (values) =>
  new db.User(values).save().then((user) => user.toObject());
