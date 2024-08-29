import { AdminModel } from "../db/admin.js";

export const getAdmins = () => AdminModel.find().sort([["createdAt", -1]]);

export const getAdminById = (id) => AdminModel.findById(id);

export const getAdminByEmail = (email) => AdminModel.findOne({ email });

export const getAdminBySessionToken = (sessionToken) =>
  AdminModel.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const createAdmin = (values) =>
  new AdminModel(values).save().then((admin) => admin.toObject());

export const deleteAdminById = (id) => AdminModel.findOneAndDelete({ _id: id });

export const updateAdminById = (id, values) =>
  AdminModel.findByIdAndUpdate(id, values);
