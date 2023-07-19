const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  url: process.env.REACT_APP_MONGODB_URL,
};
