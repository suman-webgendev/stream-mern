import { createUser, getUserByEmail } from "../actions/users.js";
import { authentication, random } from "../utils/index.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    const existingUser = await getUserByEmail(email);

    if (existingUser)
      return res.status(409).json({ message: "Email already in use!" });

    const salt = random();
    const user = await createUser({
      email,
      name,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully!" })
      .end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "No account found associated with this email!" });

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash)
      return res.status(403).json({ message: "Invalid email or password!" });

    const salt = random();

    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );
    await user.save();

    res.cookie("stream_auth", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Successfully logged in." }).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
