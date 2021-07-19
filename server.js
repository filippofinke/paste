require("dotenv").config();
const StormDB = require("stormdb");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const uuidv4 = require("uuid").v4;

process.env.PORT = process.env.PORT || 3000;
process.env.SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
const app = express();

const engine = new StormDB.localFileEngine(path.join(__dirname, "db.stormdb"));
const db = new StormDB(engine);

app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

app.get("/paste/:id", (req, res) => {
  let id = req.params.id;

  let paste = db.get(id).value();
  if (paste) {
    return res.json({ text: paste.text });
  } else {
    return res.sendStatus(404);
  }
});

app.post("/paste", (req, res) => {
  let master = req.headers["x-paste-master"];

  if (master) {
    let id = uuidv4();
    while (typeof db.get(id).value() != "undefined") {
      id = uuidv4();
    }
    bcrypt.hash(master, Number(process.env.SALT_ROUNDS), (err, hash) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        db.set(id, {
          master: hash,
          text: "",
        });

        db.save();

        return res.json({ id: id });
      }
    });
  } else {
    return res.sendStatus(400);
  }
});

app.put("/paste/:id", (req, res) => {
  let id = req.params.id;
  let master = req.headers["x-paste-master"];
  let text = req.body.text;
  if (master && text) {
    let paste = db.get(id).value();
    if (paste) {
      bcrypt.compare(master, paste.master, (err, result) => {
        if (err) {
          return res.sendStatus(500);
        }

        if (result) {
          db.get(id).get("text").set(text);
          db.save();
          return res.sendStatus(200);
        } else {
          return res.sendStatus(401);
        }
      });
    } else {
      return res.sendStatus(404);
    }
  } else {
    return res.sendStatus(400);
  }
});

app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log("server started on port " + process.env.PORT);
});
