const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());

// include and initialize the rollbar library with your access token
var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: "a66582f724684cc1a06899cbc2a4182f",
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// record a generic message and send it to Rollbar
rollbar.log("Hello world!");

const students = ["Jimmy", "Timothy", "Jimothy"];

app.delete("/api/students/:index", (req, res) => {
  try {
    nonExistentFunction();
  } catch (error) {
    console.error(error);
    rollbar.error("non-existant function");
    res.status(400).send(students);
  }
});

app.get("/", (req, res) => {
  rollbar.info("homepage loaded succesfull");
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/students", (req, res) => {
  rollbar.info("all students sent successfully");
  res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
  let { name } = req.body;

  const index = students.findIndex((student) => {
    return student === name;
  });

  try {
    if (index === -1 && name !== "") {
      students.push(name);
      rollbar.info("added student to list");
      res.status(200).send(students);
    } else if (name === "") {
      res.status(400).send("You must enter a name.");
    } else {
      res.status(400).send("That student already exists.");
    }
  } catch (err) {
    rollbar.critical("hacker has deleted the student array???");
    console.log(err);
  }
});

app.delete("/api/students/:index", (req, res) => {
  const targetIndex = +req.params.index;

  rollbar.info("deleted student from list");
  students.splice(targetIndex, 1);
  res.status(200).send(students);
});

app.use(rollbar.errorHandler());

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server listening on ${port}`));
