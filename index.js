const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAE,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome on my server" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
