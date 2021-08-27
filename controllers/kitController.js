require("dotenv").config();
const Kit = require("../models/kit");
const League = require("../models/league");
const Team = require("../models/team");
const async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = function (req, res, next) {
  async.parallel(
    {
      league_count: (callback) => League.countDocuments({}, callback),
      team_count: (callback) => Team.countDocuments({}, callback),
      kit_count: (callback) => Kit.countDocuments({}, callback),
      leagues: (callback) => League.find(callback),
      teams: (callback) => Team.find(callback),
      kits: (callback) => Kit.find(callback),
    },
    (err, results) => {
      if (err) return next(err);

      res.render("home", { title: "Home", data: results, error: err });
    }
  );
};

// Display list of all kits
exports.kit_list = function (req, res, next) {
  Kit.find().exec((err, kits) => {
    if (err) return next(err);

    res.render("kit_list", { title: "All Kits", kits });
  });
};

// Display detail page for a specific kit.
exports.kit_detail = function (req, res, next) {
  Kit.findById(req.params.id)
    .populate("team")
    .exec((err, kit) => {
      if (err) return next(err);

      if (kit === null) {
        const error = new Error("Kit not found");
        error.status = 404;
        return next(error);
      }

      res.render("kit_detail", { title: "Kit Detail", kit });
    });
};

// Display kit create form on GET.
exports.kit_create_get = function (req, res, next) {
  Team.find().exec((err, teams) => {
    if (err) return next(err);

    res.render("kit_form", { title: "Create Kit", teams });
  });
};

// Handle kit create on POST.
exports.kit_create_post = [
  // validate & sanitize
  body("name", "Name cannot be empty").trim().isLength({ min: 3 }),

  body("description", "Description cannot be empty")
    .trim()
    .isLength({ min: 3 }),

  body("price", "Price cannot be empty")
    .trim()
    .isFloat({ min: 1, max: 1000 })
    .escape(),

  body("stock", "Stock cannot be empty")
    .trim()
    .isInt({ min: 1, max: 100 })
    .escape(),

  body("team", "Team cannot be empty").trim().isLength({ min: 1 }).escape(),

  // process request
  (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // create new kit object
    const kit = new Kit({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      team: req.body.team,
    });

    // If file, set name
    if (req.file && errors.isEmpty()) {
      kit.fileName = req.file.filename;
    } else if (req.body.fileName) {
      kit.fileName = req.body.fileName;
    }

    if (!errors.isEmpty()) {
      Team.find().exec((err, teams) => {
        if (err) return next(err);

        res.render("kit_form", {
          title: "Create Kit",
          teams,
          errors: errors.array(),
        });
      });
      return;
    } else {
      kit.save((err) => {
        if (err) return next(err);

        res.redirect(kit.url);
      });
    }
  },
];

// Display kit delete form on GET.
exports.kit_delete_get = function (req, res, next) {
  Kit.findById(req.params.id).exec((err, kit) => {
    if (err) return next(err);

    if (kit === null) res.redirect("/store/kits");

    res.render("kit_delete", { title: "Delete Kit", kit });
  });
};

// Handle kit delete on POST.
exports.kit_delete_post = function (req, res, next) {
  // check password
  if (req.body.password !== process.env.PASSWORD) {
    const error = new Error("Incorrect Password");
    error.status = 401;
    return next(error);
  }

  Kit.findByIdAndRemove(req.params.id).exec((err, kit) => {
    if (err) return next(err);

    Kit.findByIdAndRemove(req.body.kitid, function deleteKit(err) {
      if (err) return next(err);

      res.redirect("/store/kits");
    });
  });
};

// Display kit update form on GET.
exports.kit_update_get = function (req, res, next) {
  async.parallel(
    {
      kit: (callback) => Kit.findById(req.params.id).exec(callback),
      teams: (callback) => Team.find(callback),
    },
    (err, results) => {
      if (err) return next(err);

      if (results.kit === null) {
        const error = new Error("Kit not found");
        error.status = 404;
        return next(err);
      }

      res.render("kit_form", {
        title: "Update Kit",
        kit: results.kit,
        teams: results.teams,
        isUpdating: true,
      });
    }
  );
};

// Handle kit update on POST.
exports.kit_update_post = [
  // validate and sanitize
  body("name", "Name cannot be empty").trim().isLength({ min: 3 }),

  body("description", "Description cannot be empty")
    .trim()
    .isLength({ min: 3 }),

  body("price", "Price cannot be empty")
    .trim()
    .isFloat({ min: 1, max: 1000 })
    .escape(),

  body("stock", "Stock cannot be empty")
    .trim()
    .isInt({ min: 1, max: 100 })
    .escape(),

  body("team", "Team cannot be empty").trim().isLength({ min: 1 }).escape(),

  // process request
  (req, res, next) => {
    // check password
    if (req.body.password !== process.env.PASSWORD) {
      const error = new Error("Incorrect Password");
      error.status = 401;
      return next(error);
    }

    // extract errors
    const errors = validationResult(req.body);

    // create new kit object
    const kit = new Kit({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      team: req.body.team,
      _id: req.params.id,
    });

    // if file set file name
    if (req.file && errors.isEmpty()) {
      kit.fileName = req.file.filename;
    } else {
      kit.filename = req.body.fileName;
    }

    // re-render if errors
    if (!errors.isEmpty()) {
      async.parallel(
        {
          kit: (callback) => Kit.findById(req.params.id).exec(callback),
          teams: (callback) => Team.find(callback),
        },
        (err, results) => {
          if (err) return next(err);

          if (results.kit === null) {
            const error = new Error("Kit not found");
            error.status = 404;
            return next(err);
          }

          res.render("kit_form", {
            title: "Update kit",
            kit,
            teams: results.teams,
            errors: errors.array(),
            isUpdating: true,
          });
        }
      );
      return;
    } else {
      Kit.findByIdAndUpdate(req.params.id, kit, {}, function (err, thekit) {
        if (err) return next(err);

        res.redirect(thekit.url);
      });
    }
  },
];
