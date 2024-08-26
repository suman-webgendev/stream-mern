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

export const updateUserSessionToken = async (userId, newToken) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        "authentication.sessionToken": newToken,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user session token:", error);
    throw error;
  }
};
