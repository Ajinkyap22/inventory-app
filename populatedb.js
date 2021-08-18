// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

const async = require("async");
const League = require("./models/league");
const Team = require("./models/team");
const Kit = require("./models/kit");

const mongoose = require("mongoose");
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var authors = [];
var genres = [];
var books = [];
var bookinstances = [];

const leagues = [];
const teams = [];
const kits = [];

function leagueCreate(name, description, cb) {
  const leagueDetail = { name: name, description: description };

  const league = new League(leagueDetail);

  league.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New League: " + league);
    leagues.push(league);
    cb(null, league);
  });
}

function teamCreate(name, description, league, cb) {
  const teamDetail = { name: name, description: description, league: league };

  const team = new Team(teamDetail);

  team.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Team: " + team);
    teams.push(team);
    cb(null, team);
  });
}

function kitCreate(name, description, price, stock, team, cb) {
  const kitDetail = {
    name: name,
    description: description,
    price: price,
    stock: stock,
    team: team,
  };

  const kit = new Kit(kitDetail);

  kit.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Kit: " + kit);
    kits.push(kit);
    cb(null, kit);
  });
}

function createLeagues(cb) {
  async.parallel(
    [
      (callback) =>
        leagueCreate(
          "Premier League",
          "The Premier League, often referred to as the English Premier League or the EPL, is the top level of the English football league system.",
          callback
        ),
      (callback) =>
        leagueCreate(
          "La Liga",
          "La Liga, officially known as LaLiga Santander, is the men's top professional football division of the Spanish football league system.",
          callback
        ),
      (callback) =>
        leagueCreate(
          "Ligue 1",
          "Ligue 1, officially known as Ligue 1 Uber Eats, is a French professional league for men's association football clubs.",
          callback
        ),
      (callback) =>
        leagueCreate(
          "Serie A",
          "Serie A, also called Serie A TIM,  is a professional league competition for football clubs located at the top of the Italian football league system.",
          callback
        ),
      (callback) =>
        leagueCreate(
          "Bundesliga",
          "Bundesliga, is a professional association football league in Germany. At the top of the German football league system, the Bundesliga is Germany's primary football competition.",
          callback
        ),
    ],
    cb
  );
}

function createTeams(cb) {
  async.parallel(
    [
      (callback) =>
        teamCreate(
          "Arsenal F.C.",
          "Arsenal Football Club is a professional football club based in London. Arsenal plays in the Premier League, the top flight of English football.",
          leagues[0],
          callback
        ),
      (callback) =>
        teamCreate(
          "Real Madrid CF",
          "Real Madrid is a Spanish professional football club based in Madrid. Real Madrid plays in La Liga, the top flight of Spanish football.",
          leagues[1],
          callback
        ),
      (callback) =>
        teamCreate(
          "Paris Saint-Germain F.C.",
          "PSG is a professional football club based in Paris. They compete in Ligue 1, the top division of French football.",
          leagues[2],
          callback
        ),
      (callback) =>
        teamCreate(
          "Juventus F.C.",
          "Juventus is a professional football club based in Turin, that competes in the Serie A, the top tier of the Italian football league system.",
          leagues[3],
          callback
        ),
      (callback) =>
        teamCreate(
          "FC Bayern Munich",
          "FC Bayern is a German professional sports club based in Munich. It plays in the Bundesliga, the top tier of the German football league system. ",
          leagues[4],
          callback
        ),
    ],
    cb
  );
}

function createKits(cb) {
  async.parallel(
    [
      (callback) =>
        kitCreate(
          "Arsenal 2021/22 Home Kit",
          "Arsenal Football Club's home kit for 2021/22 season. Colour: Red/White. Sizes: XS/S/M/L/XL/2XL",
          144,
          10,
          teams[0],
          callback
        ),
      (callback) =>
        kitCreate(
          "Real Madrid 2021/22 Home Kit",
          "Real Madrid CF's home kit for 2021/22 season. Colour: White/Blue. Sizes: XS/S/M/L/XL/2XL",
          164,
          15,
          teams[1],
          callback
        ),
      (callback) =>
        kitCreate(
          "Paris Saint-Germain 2021/22 Home Kit",
          "Paris Saint-Germain Football Club's home kit for 2021/22 season. Colour: Blue. Sizes: XS/S/M/L/XL/2XL",
          187,
          10,
          teams[2],
          callback
        ),
      (callback) =>
        kitCreate(
          "Juventus F.C. 2021/22 Home Kit",
          "Juventus Football Club's home kit for 2021/22 season. Colour: White/Black. Sizes: XS/S/M/L/XL/2XL",
          164,
          20,
          teams[3],
          callback
        ),
      (callback) =>
        kitCreate(
          "FC Bayern Munich 2021/22 Home Kit",
          "FC Bayern Munich's home kit for 2021/22 season. Colour: Red. Sizes: XS/S/M/L/XL/2XL",
          180,
          15,
          teams[4],
          callback
        ),
    ],
    cb
  );
}

async.series([createLeagues, createTeams, createKits], (err, results) => {
  if (err) {
    console.log("FINAL ERR: " + err);
  } else {
    console.log("All done");
  }
  // All done, disconnect from database
  mongoose.connection.close();
});
