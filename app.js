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

app.get("/user/profile", async (req, res) => {
    res.send(req.user);
});

app.put("/user/profile", async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password', 'mobile']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
