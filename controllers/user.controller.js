const { User } = require("../models");

// ================== Get All Users ==================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

// ================== Get User by ID ==================
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
  }
};

// ================== Create User ==================
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const newUser = await User.create({
      name,
      email,
      password, // 🔑 In production: hash before saving
      phone,
      role,
    });

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create user", error: error.message });
  }
};

// ================== Update User ==================
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, loyaltyPoints } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.update({ name, email, phone, role, loyaltyPoints });

    res.json({ success: true, message: "User updated successfully", data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

// ================== Delete User ==================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
