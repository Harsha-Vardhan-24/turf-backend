const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { checAdminExists } = require("../models/checkAdminExists");

const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch admin details by email
    const admin = await checAdminExists(email);

    if (!admin) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    // Check if admin has a password and that it matches
    if (!admin.password) {
      return res
        .status(500)
        .json({ message: "Server error: Missing password hash" });
    }

    // Compare the password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT (replace 'yourSecretKey' with your actual secret key)
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email }, // Payload data
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Token expiration time
    );

    // Send the JWT to the client along with a success message
    return res.status(200).json({
      message: "Authenticated",
      token: token, // Send the JWT
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = authAdmin;
