"use strict";

import { db } from "../db/index.js";

export const getAdmins = () => db.Admin.find().sort([["createdAt", -1]]);

export const getAdminById = (id) => db.Admin.findById(id);

export const getAdminByEmail = (email) => db.Admin.findOne({ email });

export const getAdminBySessionToken = (sessionToken) =>
  db.Admin.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const createAdmin = (values) =>
  new db.Admin(values).save().then((admin) => admin.toObject());
