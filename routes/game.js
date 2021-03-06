const express = require("express");
const router = express.Router();
const path = require("path");
const debug = require("debug")("comp2930-team2:server");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const { User } = require("../src/models/user");
const http = require("http");

// -------------------------------------------------- Routing -----------------------------------------------------

/* GET game home page. */
// Probably  remove this because the game files will be served based on the post (create game)
// and put (join game)
router.get("/", (req, res) => {
  res.render(path.resolve(__dirname, "../game/public/index.html"), {
    title: "Express"
  });
});

// Sends the information on the lobby that the given user is registered in or 404
// if not registered in a lobby
router.get("/lobbyinfo", async (req, res) => {
  var token = req.get("auth-token");
  if (!token) return res.status(400).send("Uh Oh! You dont have a token!");
  const decode = jwt.verify(token, "FiveAlive");
  token = jwt.decode(token);

  const user = await User.findById(token._id).select("-password");
  if (!user) return res.status(400).send("Uh Oh! You dont exist!");

  for (let lobby of lobbies) {
    for (let player of lobby.players) {
      if (JSON.stringify(player._id) == JSON.stringify(user._id)) {
        return res.send(lobby);
      }
    }
  }

  res.status(404).send("No lobby found");
});

// Routing to game lobby
router.get("/lobby", (req, res) => {
  res.render(path.resolve(__dirname, "../public/views/gameLobby.html"));
});

// Creating a game lobby
router.post("/", async (req, res) => {
  var token = req.get("auth-token");
  if (!token) return res.status(400).send("Uh Oh! You dont have a token!");
  const decode = jwt.verify(token, "FiveAlive");
  token = jwt.decode(token);

  const user = await User.findById(token._id).select("-password");
  if (!user) return res.status(400).send("Uh Oh! You dont exist!");

  const lobby = _.pick(req.body, ["gameType", "sessionId", "sessionPass"]);

  // Check if session id is taken
  if (getLobbyBySession(lobby.sessionId)) {
    return res.status(400).send("GameId taken");
  }

  // Create the players array and add the owner to that array
  lobby.owner = user._id;
  lobby.players = [];
  lobby.players.push(user);
  lobbies.push(lobby);

  console.log("Creating a new session: " + lobby);

  res.send(lobby);
});

// Register a user to a lobby
router.put("/", async (req, res) => {
  var token = req.get("auth-token");
  if (!token) return res.status(400).send("Uh Oh! You dont have a token!");
  const decode = jwt.verify(token, "FiveAlive");
  token = jwt.decode(token);

  const user = await User.findById(token._id).select("-password");
  if (!user) return res.status(400).send("Uh Oh! You dont exist!");

  const lobbyInfo = _.pick(req.body, ["sessionId", "sessionPass"]);
  const lobby = getLobbyBySession(lobbyInfo.sessionId);

  // Didn't find a lobby
  if (!lobby)
    return res
      .status(404)
      .send("Failed to find room at: " + lobbyInfo.sessionId);

  // Invalid password
  if (lobby.sessionPass !== lobbyInfo.sessionPass)
    return res.status(400).send("Invalid session password");

  // Add user to the lobby and return lobby info
  lobby.players.push(user);
  res.send(lobby);
});

module.exports = router;

