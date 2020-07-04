require("dotenv").config();
var mysql = require("mysql");

const { connectDb, choice } = require("./Process/HelperFunctions");

const { sendNotificationMail, sendGreetingMail } = require("./Process/Mail");
const {
  checkForBlacklist,
  isSpecialMomentValid,
  allocateSubscribers
} = require("./Process/customFunctions");

//DB CONNECTION
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "220682",
  database: "db_employees"
});

var greetings = [];
var notification = [];
var subscribers = [];

//this whole is only the process
setInterval(() => {
  connectDb(connection)
    .then(async allUsers => {
      var res; //variable to store query result
      var flag;

      console.log("allUsers length is" + allUsers.length);
      console.log("allusers are", allUsers);
      //match dob with today date of all rows
      for (i = 0; i < allUsers.length; i++) {
        let user = allUsers[i];
        console.log("user ISSSSSS", user);
        if (!isSpecialMomentValid(user)) continue;
        console.log("TODAY is a special day for:", user);
        //1.if allUsers[i] special date matched with their today's date, push to array greetings
        //2.for each  entry in greeting loop through all other data.....
        greetings.push(user);
        //push all those in array subscribers,who has subscribed for allUsers[i]
        //eachUserChoices contains subscriptions,blacklist etc details
        let eachUserChoices = await choice(connection);
        console.log("eachUserChoices is");
        console.log(eachUserChoices);
        subscribers = [];
        allocateSubscribers(eachUserChoices, user, subscribers);
        console.log("the person who subscribed to" + user.email + "are:");
        console.log(subscribers);
        console.log("subscribers length is " + subscribers.length);
        //checkForBlacklist checks if subscribers array has any entry which is on blacklist by user
        await checkForBlacklist(user, subscribers, notification).then();
      }

      //allow less secure apps on your gmail account first, to send mail
      sendGreetingMail(greetings, notification);
      sendNotificationMail(notification);
    })
    .catch(err => {
      console.log("res err");
      console.log(err);
    });
}, 15000);

console.log("...");
