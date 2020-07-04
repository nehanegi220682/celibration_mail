const { getCurrentUserChoices } = require("./HelperFunctions");
const { connection } = require("./DBconnection");

////checkForBlacklist checks if subscribers array has any entry which is on blacklist by current user
//if not then push them to array notification
function checkForBlacklist(user, subscribers, notification) {
  //getCurrentUserChoices contains all rows with employee_id that of current user from table choices
  //i.e subscriptions and blacklist of current user
  return getCurrentUserChoices(connection, user).then(
    currentUser_friendlist => {
      //check if resobj blacklist == subscribers
      console.log("user object inside  checkblacklist is:");
      console.log(user);
      console.log("subscribers are");
      console.log(subscribers);
      console.log("pushING to array notification");
      console.log("userfriendlist len:" + currentUser_friendlist.length);
      console.log("subscribers len is " + subscribers.length);

      var temp = 0;
      for (let i = 0; i < subscribers.length; i++) {
        console.log("inside first loop");
        for (let j = 0; j < currentUser_friendlist.length; j++) {
          console.log("inside 2nd for loop");
          console.log(subscribers);
          console.log(subscribers[i].email);
          console.log("notification array is:");
          console.log(notification);
          if (subscribers[i].email == currentUser_friendlist[j].blacklist) {
            temp = 1;
            console.log(
              "subscribers[i].email is under blacklist and a subscriber"
            );
            break;
          }
        }

        if (temp == 0) {
          //  push to array notification
          subscribers[i].event_owner = currentUser_friendlist[0].first_name;
          subscribers[i].event_name = currentUser_friendlist[0].event_name;
          subscribers[i].event_address = currentUser_friendlist[0].email;
          notification.push(subscribers[i]);
          console.log("pushed to array notification");
          console.log(notification);
        }
      }
    }
  );
} //END OF checkForBlacklist

const isSpecialMomentValid = user => {
  // timezone
  var d = new Date();
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset

  var nd = new Date(utc + 3600000 * user.offset);

  if (
    user.MONTH == nd.getMonth() + 1 &&
    user.DAY == nd.getDate() &&
    user.flag == 0
  )
    return true;
  else return false;
};

const allocateSubscribers = (eachUserChoices, user, subscribers) => {
  for (let c = 0; c < eachUserChoices.length; c++) {
    if (eachUserChoices[c].subscriptions == user.email) {
      subscribers.push(eachUserChoices[c]);
    }
  }
};

module.exports = {
  checkForBlacklist,
  isSpecialMomentValid,
  allocateSubscribers
};
