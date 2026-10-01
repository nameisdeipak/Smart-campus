const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const { id } = payload;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = adminMiddleware;

// const jwt = require("jsonwebtoken");
// const User = require("../Models/user");

// const adminMiddleware = async (req, res, next) => {
//   try {
//     console.log("========== ADMIN AUTH CHECK ==========");

//     console.log("Cookies:", req.cookies);

//     const { token } = req.cookies;

//     if (!token) {
//       console.log("❌ TOKEN NOT FOUND");

//       return res.status(401).json({
//         success: false,
//         message: "Authentication token is missing",
//       });
//     }

//     console.log("✅ TOKEN FOUND");

//     const payload = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     console.log("JWT Payload:", payload);

//     const user = await User.findById(payload.id);

//     if (!user) {
//       console.log("❌ USER NOT FOUND");

//       return res.status(401).json({
//         success: false,
//         message: "User does not exist",
//       });
//     }

//     console.log("User:", {
//       id: user._id,
//       email: user.email,
//       role: user.role,
//     });

//     if (user.role !== "admin") {
//       console.log("❌ NOT ADMIN");

//       return res.status(403).json({
//         success: false,
//         message: "Admin access required",
//       });
//     }

//     console.log("✅ ADMIN VERIFIED");

//     req.user = user;

//     next();

//   } catch (error) {

//     console.log("❌ AUTH ERROR:", error.message);

//     return res.status(401).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = adminMiddleware;