const express = require("express");
const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/css/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
const PORT = 4000;
const isAuthenticated = require("./middleware/verify");
const session = require("express-session");

let app = express();
let gameModel = require("./models/gameModel");
let registrations = require("./models/registrations");
let User = require("./models/user");

app.use("/public", express.static("public"));
app.use("public/css", express.static("../public"));
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.use(
  session({
    secret: "thisissecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Basic Express Translation =====================================================================

app.get("/", (req, res) => {
  console.log("Rendering and Sending 'Login Page'");
  res.render("landingPage");
});

app.get("/register", (req, res) => {
  console.log("Rendering and Sending 'Login Page'");
  res.render("signup");
});

app.get("/home", (req, res) => {
  console.log("Rendering and Sending 'Landing Page'");
  res.render("landingPage");
});

app.get("/services", async (req, res) => {
  const tournaments = await gameModel.find();
  console.log("Rendering and Sending 'Services Page'");
  res.render("servicesPage", { tournaments });
});

app.get("/games", async (req, res) => {
  let games = await gameModel.find();
  let registeredUsers = await registrations.find().countDocuments();
  // console.log(games)
  res.render("games.ejs", { games, registeredUsersCount: registeredUsers });
});
app.get("/update/:id", async (req, res) => {
  console.log("in update", req.body);
  try {
    // Extract the game ID from the route parameter
    const gameId = req.params.id;
    const game = await gameModel.findById(gameId);

    if (!game) {
      return res.status(404).send("Game not found");
    }

    res.render("update.ejs", { game });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// ==============================================================================================

// GAME CRUD ====================================================================================

app.get("/delete:id", async (req, res) => {
  console.log(`Game ID Deletion: ${{ _id: req.params.id.split(":")[1] }}`);
  let gameToDelete = await gameModel.findByIdAndDelete({
    _id: req.params.id.split(":")[1],
  });
  console.log(`Game Deleted: ${gameToDelete}`);
  res.redirect("/games");
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/addGame", upload.single("image"), async (req, res, next) => {
  try {
    // Create a new game instance
    let gameToAdd = new gameModel();
    gameToAdd.title = req.body.title;
    gameToAdd.genre = req.body.genre;
    gameToAdd.date = req.body.date;
    gameToAdd.time = req.body.time;

    // Check if an image file was uploaded
    if (req.file) {
      gameToAdd.image = "public/css/uploads/" + req.file.filename;
      console.log("Image name ", req.file.filename);
    }

    // Save the game to the database
    await gameToAdd.save();

    res.redirect("/games");
  } catch (error) {
    // Handle errors here
    next(error);
  }
});
app.post("/updateGame/:id", upload.single("image"), async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const gameToUpdate = await gameModel.findById(gameId);

    if (!gameToUpdate) {
      return res.status(404).send("Game not found");
    }

    // Update the game fields based on the submitted form data
    gameToUpdate.title = req.body.title;
    gameToUpdate.genre = req.body.genre;
    gameToUpdate.date = req.body.date;
    gameToUpdate.time = req.body.time;

    // Check if an image file was uploaded
    if (req.file) {
      gameToUpdate.image = "public/css/uploads/" + req.file.filename;
      console.log("Image name ", req.file.filename);
    }

    // Save the updated game to the database
    await gameToUpdate.save();

    res.redirect("/games");
  } catch (error) {
    // Handle errors here
    next(error);
  }
});

// ================================================================================================

// User CRUD ======================================================================================
//

app.post("/register", async (req, res) => {
  let user = new User(req.body);

  user.name = req.body.email;
  user.password = req.body.password;
  console.log("user");
  await user.save();
  res.redirect("/");
  // }
});
app.post("/register-tournament", async (req, res) => {
  try {
    const userEmail = req.body.email;

    // Check if the email already exists in the registrations collection
    const existingUser = await registrations.findOne({ email: userEmail });

    if (existingUser) {
      // Email already exists, handle accordingly (e.g., send an error message)
      return res
        .status(400)
        .send("User with this email already registered for the tournament");
    } else {
      // Email does not exist, proceed with registration
      const newUser = new registrations({
        name: req.body.name,
        email: userEmail,
        tournamentid: req.body.tournamentId,
      });

      await newUser.save();
      return res.status(200).send("User Saved");
      // res.redirect("/"); // Redirect to the desired page after successful registration
    }
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


const bcrypt = require("bcryptjs");



app.get("/logout-user", async (req, res) => {
  req.session.user = null;
  console.log("session clear");
  return res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  console.log("req.body", req.body);
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    console.log("User donot exist");
    // req.session.user = user;
    // req.session.flash = { type: "danger", message: "User Not Present" };
    // req.flash("danger", "User with this email not present");
    return res.redirect("/login");
  } else {
    console.log("User exist", user);
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
      req.session.user = user;
      // req.flash("success", "Logged in Successfully");
      return res.redirect("/games");
    } else {
      // req.flash("danger", "Invalid Password");
      return res.redirect("/");
    }
  }
});

// =========================================================================================

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

const MONGODBURL =
  "mongodb+srv://admin:admin@cluster0.jo37mtt.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(MONGODBURL, { useNewUrlParser: true })
  .then(() => console.log("MongoDB: Connected"))
  .catch((error) => console.log(error.message));
