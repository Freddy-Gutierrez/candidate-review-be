require("express-async-errors");
const winston = require("winston");

module.exports = function () {
  // CATCH-ALL for catching uncaught synchronous exceptions
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExpceptions.log" })
  );

  // CATCH-ALL for catching uncaught asynchronous(promises) exceptions
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
