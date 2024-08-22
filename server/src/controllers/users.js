import { getUsers } from "../actions/users.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error("[getAllUser]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
