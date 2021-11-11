require("dotenv").config();
const League = require("../models/league");
const Team = require("../models/team");
const { body, validationResult } = require("express-validator");
const async = require("async");

// Display list of all leagues
exports.league_list = function (req, res, next) {
  League.find().exec((err, leagues) => {
    if (err) return next(err);

    res.render("league_list", { title: "All Leagues", leagues });
  });
};

// Display detail page for a specific league.
exports.league_detail = function (req, res, next) {
  async.parallel(
    {
      league: (callback) =>
        League.findById(req.params.id).populate("team").exec(callback),
      teams: (callback) => Team.find({ league: req.params.id }).exec(callback),
    },
    function (err, results) {
      if (err) return next(err);

      if (results.league == null) {
        const error = new Error("League not found");
        error.status = 404;
        return next(error);
      }

      res.render("league_detail", {
        title: "League Detail",
        teams: results.teams,
        league: results.league,
      });
    }
  );
};

// Display league create form on GET.
exports.league_create_get = function (req, res, next) {
  res.render("league_form", { title: "Create League" });
};

// Handle league create on POST.
exports.league_create_post = [
  // Validate & sanitize field
  body("name", "Name cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .isAlphanumeric()
    .withMessage("Name must be alphanumeric"),

  body("description", "Description cannot be empty")
    .trim()
    .isLength({ min: 1 }),

  // Process request
  (req, res, next) => {
    // Extract errors
    const errors = validationResult(req.body);

    // Create league object
    const league = new League({
      name: req.body.name,
      description: req.body.description,
    });

    // If file, set name
    if (req.file && errors.isEmpty()) {
      league.fileName = req.file.filename;
    } else if (req.body.fileName) {
      league.fileName = req.body.fileName;
    }

    // Render again with errors
    if (!errors.isEmpty()) {
      res.render("league_form", {
        title: "Create League",
        league,
        errors: errors.array(),
      });
      return;
    } else {
      // Save
      league.save((err) => {
        if (err) return next(err);

        res.redirect(league.url);
      });
    }
  },
];

// Display league delete form on GET.
exports.league_delete_get = function (req, res, next) {
  async.parallel(
    {
      league: (callback) => League.findById(req.params.id).exec(callback),
      teams: (callback) => Team.find({ league: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.league == null) res.redirect("/store/leagues");

      res.render("league_delete", {
        title: "Delete League",
        league: results.league,
        teams: results.teams,
      });
    }
  );
};

// Handle league delete on POST.
exports.league_delete_post = function (req, res, next) {
  async.parallel(
    {
      league: (callback) => League.findById(req.body.leagueid).exec(callback),
      teams: (callback) =>
        Team.find({ league: req.body.leagueid }).exec(callback),
    },
    (err, results) => {
      if (req.body.password !== process.env.PASSWORD) {
        const error = new Error("Incorrect Password");
        error.status = 401;
        return next(error);
      }

      if (err) return next(err);

      if (results.teams.length > 0) {
        res.render("league_delete", {
          title: "Delete League",
          league: results.league,
          teams: results.teams,
        });
        return;
      } else {
        League.findByIdAndRemove(req.body.leagueid, function deleteLeague(err) {
          if (err) return next(err);

          res.redirect("/store/leagues");
        });
      }
    }
  );
};

// Display league update form on GET.
exports.league_update_get = function (req, res, next) {
  console.log(process.env.PASSWORD);
  League.findById(req.params.id, (err, league) => {
    if (err) return next(err);

    if (league === null) {
      const error = new Error("League not found");
      error.status = 404;
      return next(error);
    }

    res.render("league_form", {
      title: "Update League",
      league,
      isUpdating: true,
    });
  });
};

// Handle league update on POST.
exports.league_update_post = [
  // Validate and sanitize
  body("name", "Name cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .isAlphanumeric()
    .withMessage("Name must be alphanumeric"),

  body("description", "Description cannot be empty")
    .trim()
    .isLength({ min: 1 }),
  // process request
  (req, res, next) => {
    // check for password
    if (req.body.password !== process.env.PASSWORD) {
      const error = new Error("Incorrect Password");
      error.status = 401;
      return next(error);
    }

    // extract errors
    const errors = validationResult(req.body);

    // create object
    const league = new League({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    // If file, set name
    if (req.file && errors.isEmpty()) {
      league.fileName = req.file.filename;
    } else if (req.body.fileName) {
      league.fileName = req.body.fileName;
    }

    // render again if errors
    if (!errors.isEmpty()) {
      res.render("league_form", {
        title: "Update League",
        league,
        errors: errors.array(),
        isUpdating: true,
      });
      return;
    } else {
      // save league
      League.findByIdAndUpdate(
        req.params.id,
        league,
        {},
        function (err, theleague) {
          if (err) return next(err);

          res.redirect(theleague.url);
        }
      );
    }
  },
];
