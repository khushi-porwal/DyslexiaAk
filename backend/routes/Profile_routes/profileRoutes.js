const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile_model/Profile");
const upload = require("../../middleware/ProfileUpload/upload");

// GET profile (single user for now)
router.get("/", async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE profile
router.put("/", async (req, res) => {
  try {

    const updated = await Profile.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.put("/avatar", upload.single("avatar"), async (req, res) => {

//   // console.log("BODY:", req.body);
//   console.log("FILE:", req.file);   // ⭐ CRITICAL

//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   try {
//     const user = await Profile.findOneAndUpdate(
//       {},
//       { avatar: req.file.path },
//       { new: true, upsert: true }
//     );

//     res.json(user);

//   } catch (err) {
//     console.log("DB ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.put("/avatar", upload.single("avatar"), async (req, res) => {
//   try {
//     console.log("📦 FILE RECEIVED:", req.file);

//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const user = await Profile.findOne();

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.avatar = req.file.path;
//     await user.save();

//     res.json(user);

//   } catch (error) {
//     console.error("🔥 AVATAR UPLOAD ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// });


router.put(
  "/avatar",

  // 🔍 Debug Content-Type
  (req, res, next) => {
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    next();
  },

  upload.single("avatar"),

  async (req, res) => {
    try {
      console.log("📦 FILE RECEIVED:", req.file);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await Profile.findOne();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Cloudinary gives URL in req.file.path
      user.avatar = req.file.path;

      await user.save();

      res.json(user);

    } catch (error) {
      console.error("🔥 AVATAR UPLOAD ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);


module.exports = router;