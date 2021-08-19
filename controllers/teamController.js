const Team = require("../models/team");
const League = require("../models/league");
const Kit = require("../models/kit");
const { body, validationResult } = require("express-validator");
const async = require("async");

// Display list of all teams
exports.team_list = function (req, res) {
  Team.find().exec((err, teams) => {
    if (err) return next(err);

    res.render("team_list", { title: "All Teams", teams });
  });
};

// Display detail page for a specific team.
exports.team_detail = function (req, res, next) {
  async.parallel(
    {
      team: (callback) =>
        Team.findById(req.params.id).populate("league").exec(callback),
      kit: (callback) => Kit.find({ team: req.params.id }).exec(callback),
    },
    function (err, results) {
      if (err) return next(err);

      if (results.team == null) {
        const error = new Error("Team not found");
        error.status = 404;
        return next(error);
      }

      res.render("team_detail", {
        title: "Team Detail",
        team: results.team,
        kits: results.kit,
      });
    }
  );
};

// Display team create form on GET.
exports.team_create_get = function (req, res) {
  League.find().exec((err, leagues) => {
    if (err) return next(err);

    res.render("team_form", { title: "Create Team", leagues });
  });
};

// Handle team create on POST.
exports.team_create_post = [
  // Validate & sanitize
  body("name", "Name cannot be empty").trim().isLength({ min: 3 }).escape(),

  body("description", "Description cannot be empty")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  body("league", "League cannot be empty").trim().isLength({ min: 1 }).escape(),

  // Process request
  (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // Create team object
    const team = new Team({
      name: req.body.name,
      description: req.body.description,
      league: req.body.league,
    });

    // If file, set name
    if (req.file && errors.isEmpty()) {
      team.fileName = req.file.filename;
    } else if (req.body.fileName) {
      team.fileName = req.body.fileName;
    }

    if (!errors.isEmpty()) {
      League.find().exec((err, leagues) => {
        if (err) return next(err);

        res.render("team_form", {
          title: "Create Team",
          leagues,
          errors: errors.array(),
          team,
        });
      });
      return;
    } else {
      team.save((err) => {
        if (err) return next(err);

        res.redirect(team.url);
      });
    }
  },
];

// Display team delete form on GET.
exports.team_delete_get = function (req, res, next) {
  async.parallel(
    {
      team: (callback) => Team.findById(req.params.id).exec(callback),
      kits: (callback) => Kit.find({ team: req.params.id }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.team == null) res.redirect("/store/teams");

      res.render("team_delete", {
        title: "Delete team",
        team: results.team,
        kits: results.kits,
      });
    }
  );
};

// Handle team delete on POST.
exports.team_delete_post = function (req, res, next) {
  async.parallel(
    {
      team: (callback) => Team.findById(req.body.teamid).exec(callback),
      kits: (callback) => Kit.find({ team: req.body.teamid }).exec(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.kits.length > 0) {
        res.render("team_delete", {
          title: "Delete Team",
          team: results.team,
          kits: results.kits,
        });
        return;
      } else {
        Team.findByIdAndRemove(req.body.teamid, function deleteteam(err) {
          if (err) return next(err);

          res.redirect("/store/teams");
        });
      }
    }
  );
};

// Display team update form on GET.
exports.team_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: team update GET");
};

// Handle team update on POST.
exports.team_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: team update POST");
};
