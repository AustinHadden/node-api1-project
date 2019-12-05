require("dotenv").config();
const express = require("express");
const db = require("./data/db.js");

const server = express();

server.use(express.json());

server.post("/api/users", (req, res) => {
  const userData = req.body;
  if (userData.name === "" || userData.bio === "") {
    res
      .status(400)
      .json({ errorMessage: "Please provide name and bio for the user." });
  } else {
    db.insert(userData)
      .then(user => {
        res.status(201).json(user);
      })
      .catch(err => {
        console.log("error saving user", err);
        res.status(500).json({
          error: "There was an error while saving the user to the database."
        });
      });
  }
});

server.get("/", (req, res) => {
  const message = process.env.MSG || "Hello World!";
  db.find()
    .then(users => {
      res.status(200).json({message, users});
    })
    .catch(err => {
      console.log("error on GET /api/users", err);
      res
        .status(500)
        .json({ error: "The users information could not be retrieved." });
    });
});

server.get("/api/users/:id", (req, res) => {
  db.findById(req.params.id)
    .then(user => {
      if (user === []) {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      } else {
        res.status(200).json(user);
      }
    })
    .catch(err => {
      console.log("error on GET /api/users/:id", err);
      res
        .status(500)
        .json({ error: "The users information could not be retrieved." });
    });
});

server.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;
  db.remove(id)
    .then(removed => {
      if (removed > 0) {
        res.status(200).json({ message: "user removed successfully", removed });
      } else {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      }
    })
    .catch(err => {
      console.log("error on DELETE /api/users/:id", err);
      res.status(500).json({ error: "The user could not be removed." });
    });
});

server.put("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const userData = req.body;
  db.findById(id)
    .then(user => {
      if (user === []) {
        res
          .status(404)
          .json({ message: "The user with the specified ID does not exist." });
      } else if (userData.name === "" || userData.bio === "") {
        res
          .status(400)
          .json({ errorMessage: "Please provide name and bio for the user." });
      } else {
        db.update(id, userData).then(updated => {
          if (updated > 0) {
            db.find()
              .then(users => {
                res.status(200).json(users);
              })
              .catch(err => {
                console.log("error on GET /api/users", err);
                res
                  .status(500)
                  .json({
                    error: "The users information could not be retrieved."
                  });
              });
          } else {
            res
              .status(500)
              .json({ error: "The user information could not be modified." });
          }
        });
      }
    })
    .catch(err => {
      console.log("error on GET /api/users/:id", err);
      res
        .status(500)
        .json({ error: "The users information could not be retrieved." });
    });
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`\n ** API running on ${port} ** \n`));
