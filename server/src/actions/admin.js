"use strict";

import { db } from "../db/index.js";

export const getAdmins = () => db.Admin.find().sort([["createdAt", -1]]);

export const getAdminByEmail = (email) => db.Admin.findOne({ email });

export const getAdminBySessionToken = (sessionToken) =>
  db.Admin.findOne({
    "authentication.sessionToken": sessionToken,
  });
