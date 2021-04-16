const express = require("express");
require("./src/db/mongoose");

const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());

// API Gateway
app.use((req, res, next) => {
  if (req.path !== "/home") next();
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
