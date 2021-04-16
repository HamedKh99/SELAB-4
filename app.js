const express = require("express");
const jwt = require("jsonwebtoken");
require("./src/db/mongoose");

const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());

// API Gateway
app.use(async (req, res, next) => {
  if (req.path === "/user/signup" || req.path === "/user/login") next();
  else {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (!user) throw new Error();

      req.token = token;
      req.user = user;
      next();
    } catch (e) {
      res.status(401).send({ error: "Please Authenticate" });
    }
  }
});

// Endpoints
app.get("/home", (req, res) => {
  res.send("hello express!");
});

app.post("/user/signup", (req, res) => {});

app.post("/user/login", (req, res) => {});

app.get("/user/profile", (req, res) => {});

app.put("/user/profile", (req, res) => {});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
