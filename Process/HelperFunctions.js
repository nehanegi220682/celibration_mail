//function to fetch all data from Db
async function connectDb(connection) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT MONTH(employee.event_date) AS MONTH , employee_id, DAY(employee.event_date) AS DAY, offset , event_name, first_name,email, flag from employee `,
      function(err, result, field) {
        if (!err) {
          console.log("connectDb fetched a result succesfully");
          resolve(result);
        } else {
          console.log(err);
        }
      }
    );
  });
}

async function choice(connection) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT choices.* , employee.email, employee.employee_id FROM employee JOIN choices  ON employee.employee_id = choices.employee_id  WHERE choices.employee_id = employee.employee_id `,
      function(err, result, field) {
        if (!err) {
          console.log('inside promise "choice"');
          resolve(result);
        } else {
          console.log(err, "choice err");
        }
      }
    );
  });
}

async function getCurrentUserChoices(connection, resobj2) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, blacklist, event_name,first_name,subscriptions, email from employee LEFT JOIN choices ON employee.employee_id = choices.employee_id  WHERE choices.employee_id = (?)`,
      resobj2.employee_id,
      function(err, result, field) {
        if (!err) {
          console.log("getUserChoices result is:");
          console.log(result);
          resolve(result);
        } else {
          console.log(err);
        }
      }
    );
  });
}

module.exports = {
  connectDb,
  choice,
  getCurrentUserChoices
};
