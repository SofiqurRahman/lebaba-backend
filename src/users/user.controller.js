const bcrypt = require('bcrypt');
const User = require("./user.model");
const generateToken = require("../middleware/generateToken");

const userRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).send({ message: "Registration successful" });
  } catch (error) {
    res.status(500).send({ message: "Registration failed", error });
  }
}

const userLoggedIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });
    const token = await generateToken(user._id);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "None" });
    res.status(200).send({ 
      message: "Logged in successful", 
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        profession: user.profession
      }
    });
  } catch(error) {
    res.status(500).send({ message: "Login failed", error });
  }
}

const userLogout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({ message: "Logged out failed", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users =  await User.find({}, 'email role').sort({ createdAt: -1 });
    res.status(200).send({ message: "All users fetched successfully", data: users })
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch all users", error });
  }
}

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  try {
    const updatedUser =  await User.findByIdAndUpdate(id, { role }, { new: true });
    if(!updatedUser) res.status(404).send({ message: "User not found" });
    res.status(200).send({ message: "User role updated successfully", data: updatedUser })
  } catch (error) {
    res.status(500).send({ message: "Failed to update user role", error });
  }
}

const editUserProfile = async (req, res) => {
  const { id } = req.params;
  const { username, profileImage, bio, profession } = req.body;

  try {
    const updateFields = { username, profileImage, bio, profession };
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) res.status(404).send({ message: "User not found" });
    res
      .status(200)
      .send({
        message: "User profile updated successfully",
        data: updateFields,
      });
  } catch (error) {
    res.status(500).send({ message: "Failed to update user profile", error });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if(!user) res.status(404).send({ message: "User not found" });
    res.status(200).send({ message: "Users deleted successfully", data: user });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete user", error });
  }
}

module.exports = { 
  userRegistration, 
  userLoggedIn, 
  userLogout, 
  getAllUsers,
  updateUserRole,
  editUserProfile,
  deleteUser
}