const User = require("../../models/User_Model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate Tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // short access token
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Email exists?
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    // Strong password check
    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });

    const hashedPass = await bcrypt.hash(password, 12); // increased salt rounds

    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
    });

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
  console.log("Signup error message:", error.message);
  console.log("Signup error response:", error?.response?.data);
  console.log("Signup error status:", error?.response?.status);

  Alert.alert(
    "Signup Failed",
    error?.response?.data?.message || "Try again"
  );
}

};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user,
    });
  } catch (error) {
  console.log("Signup error message:", error.message);
  console.log("Signup error response:", error?.response?.data);
  console.log("Signup error status:", error?.response?.status);

  Alert.alert(
    "Signup Failed",
    error?.response?.data?.message || "Try again"
  );
}

};
