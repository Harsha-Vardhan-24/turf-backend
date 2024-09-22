const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 4000;

const authentication = require("./api/routes/authentication");
const adminRoutes = require("./api/routes/adminRoutes");
const courtRoutes = require("./api/routes/courtRoutes");
const db = require("./api/config/database");

app.use("/auth", authentication);

app.use("/admin", adminRoutes);

app.use("/court", courtRoutes);

app.listen(PORT, (err) => {
  if (!err) {
    console.log("Server is running on " + PORT);
  } else {
    console.log(err);
  }
});
