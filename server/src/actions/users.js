import { UserModel } from "../db/users.js";

export const getUsers = () => UserModel.find();

export const getUserById = (id) => UserModel.findById(id);

export const getUserByEmail = (email) => UserModel.findOne({ email });

export const getUserBySessionToken = (sessionToken) =>
  UserModel.findOne({
    "authentication.sessionToken": sessionToken,
  });

export const createUser = (values) =>
  new UserModel(values).save().then((user) => user.toObject());

export const deleteUserById = (id) => UserModel.findOneAndDelete({ _id: id });

export const updateUserById = (id, values) =>
  UserModel.findByIdAndUpdate(id, values);
