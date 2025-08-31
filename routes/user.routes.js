const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

// ================== Routes ==================
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

router.get("/", getAllUsers);         // GET all users
router.get("/:id", getUserById);      // GET user by ID
router.post("/", createUser);         // CREATE user
router.put("/:id", updateUser);       // UPDATE user
router.delete("/:id", deleteUser);    // DELETE user

module.exports = router;
