const winston = require("winston");
// catches errors that happen express side
module.exports = function (err, req, res, next) {
  winston.error(err.message);
  res.status(500).send(err.message);
};
