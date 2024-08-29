import pkg from "lodash";
import { getAdminBySessionToken } from "../actions/admin.js";
const { merge } = pkg;

export const isAuthenticatedAdmin = async (req, res, next) => {
  try {
    const sessionToken = req.cookies["stream_auth"];

    if (!sessionToken) return res.status(401).redirect("/");

    const existingAdmin = await getAdminBySessionToken(sessionToken);

    if (!existingAdmin) return res.status(404).redirect("/");

    merge(req, { identity: existingAdmin });

    return next();
  } catch (error) {
    console.error("isAuthenticated middleware: ", error.cause);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
