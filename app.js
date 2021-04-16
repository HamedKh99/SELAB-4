const express = require("express");
const jwt = require("jsonwebtoken");
require("./src/db/mongoose");
const User = require("./src/models/user");

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
app.post("/user/signup", async (req, res) => {
  delete req.body.is_admin;
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get("/user/profile", (req, res) => {});

app.put("/user/profile", (req, res) => {});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
