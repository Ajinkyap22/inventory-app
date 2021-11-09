const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const leagueController = require("../controllers/leagueController");
const teamController = require("../controllers/teamController");
const kitController = require("../controllers/kitController");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: function (req, file, cb) {
    // Check file extension
    const types = /jpg|jpeg|png|gif/;
    const extension = types.test(path.extname(file.originalname));
    // Check MIME
    const mime = types.test(file.mimetype);

    return extension && mime ? cb(null, true) : cb("Error: Images only!");
  },
});

// Home page
router.get("/", kitController.index);

// LEAGUE ROUTES //

// GET for list of all leagues
router.get("/leagues", leagueController.league_list);
// GET for creating league
router.get("/league/create", leagueController.league_create_get);
// POST for creating league
router.post(
  "/league/create",
  upload.single("leagueLogo"),
  leagueController.league_create_post
);
// GET for updating league
router.get("/league/:id/update", leagueController.league_update_get);
// POST for updating league
router.post(
  "/league/:id/update",
  upload.single("leagueLogo"),
  leagueController.league_update_post
);
// GET for deleting league
router.get("/league/:id/delete", leagueController.league_delete_get);
// POST for deleting league
router.post("/league/:id/delete", leagueController.league_delete_post);
// GET for one leagues
router.get("/league/:id", leagueController.league_detail);
// TEAM ROUTES //

// GET for list of all teams
router.get("/teams", teamController.team_list);
// GET for creating team
router.get("/team/create", teamController.team_create_get);
// POST for creating team
router.post(
  "/team/create",
  upload.single("teamLogo"),
  teamController.team_create_post
);
// GET for updating team
router.get("/team/:id/update", teamController.team_update_get);
// POST for updating team
router.post(
  "/team/:id/update",
  upload.single("teamLogo"),
  teamController.team_update_post
);
// GET for deleting team
router.get("/team/:id/delete", teamController.team_delete_get);
// POST for deleting team
router.post("/team/:id/delete", teamController.team_delete_post);
// GET for one teams
router.get("/team/:id", teamController.team_detail);

// KIT ROUTES //

// GET for list of all kits
router.get("/kits", kitController.kit_list);
// GET for creating kit
router.get("/kit/create", kitController.kit_create_get);
// POST for creating kit
router.post(
  "/kit/create",
  upload.single("kitPic"),
  kitController.kit_create_post
);
// GET for updating kit
router.get("/kit/:id/update", kitController.kit_update_get);
// POST for updating kit
router.post(
  "/kit/:id/update",
  upload.single("kitPic"),
  kitController.kit_update_post
);
// GET for deleting kit
router.get("/kit/:id/delete", kitController.kit_delete_get);
// POST for deleting kit
router.post("/kit/:id/delete", kitController.kit_delete_post);
// GET for one kits
router.get("/kit/:id", kitController.kit_detail);

module.exports = router;
