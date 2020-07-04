var mysql = require("mysql");

//DB CONNECTION
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "220682",
  database: "db_employees"
});

module.exports = {
  connection
};
