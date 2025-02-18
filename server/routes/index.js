
import express from "express";

const router = express.Router();

// Basic health check
router.get("/", (req, res) => {
  res.json({ status: "Server running" });
  console.log("Server running");
});

// You can define simple routes here
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Or use other route files
// router.use("/auth", authRoutes);
// router.use("/users", userRoutes);


export default router;

