const User = require("../users/user.model");
const jwt = require("jsonwebtoken");

const JWT_SECRET =  process.env.JWT_SECRET_KEY

const generateToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user)
    if (!user) throw new Error("User not found");
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return token;
  } catch (error) {
    console.error("Error generating token", error);
    throw error;
  }
};

module.exports = generateToken;