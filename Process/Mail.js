var mysql = require("mysql");
var nodemailer = require("nodemailer");
const { connection } = require("./DBconnection");
const YOUR_EMAIL = process.env.YOUR_EMAIL;
const YOUR_PASSWORD = process.env.YOUR_PASSWORD;

//CHECK IF THERE IS SOMEONE WHO HAS SPECIAL MOMENT TODAY i.e ANY ENTRY IN GREETINGS ARRAY
//IF YES
//MATCH THEIR LOCAL TIME WITH 8 AM for those in array greeting
// SEND MAIL if time matched
//PUT FLAG = 1
async function sendGreetingMail(greetings, notification) {
  console.log("yayMEAIL PASWORDI ISS", YOUR_EMAIL, YOUR_PASSWORD);
  var d = new Date();
  var utc = d.getTime() + d.getTimezoneOffset() * 60000;
  console.log("GREETINGS INSIDE MAIL IS", greetings);
  if (greetings.length != 0) {
    for (let j = 0; j < greetings.length; j++) {
      var nd2 = new Date(utc + 3600000 * greetings[j].offset);
      console.log("inside send greeting mail nd2 hours and minutues are:");
      console.log(nd2.getHours() + "-" + nd2.getMinutes());
      //match 8 AM
      if (nd2.getHours() + "-" + nd2.getMinutes() == "23-26") {
        //send mail to those in greetings array
        let transporter = nodemailer.createTransport({
          service: "gmail",
          secure: false,
          port: 25,
          auth: {
            user: YOUR_EMAIL,
            pass: YOUR_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        let HelperOptions = {
          //   from: '"your name" <putyourmailacc@gmail.com> ',
          from: '"Neha Negi" <YOUR_EMAIL> ',
          to: greetings[j].email,
          subject: "Send Email Using Node.js",
          text: `CONGRATULATIONS ${greetings[j].first_name} for your ${greetings[j].event_name}.`
        };

        transporter.sendMail(HelperOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log("the message was sent");
          console.log("GOT INFOOOO");
          // console.log(info);
          connection.query(
            `UPDATE db_employees.employee SET flag = 1 WHERE email = (?) `,
            greetings[j].email,
            function(err, result, field) {
              if (!err) {
                console.log("no error in set flag");
                console.log(result);
              } else {
                console.log("no error in set flag");
                console.log(err);
              }
            }
          );
          greetings = greetings.splice(j, 1);
          console.log("after splice GREETINGS ARRAY is", greetings);

          setTimeout(function() {
            console.log(
              "I AM INSIDE SETTIMEOUT FLAG AND GGREETINGS MAIL  IS",
              greetings[j].email
            );
            connection.query(
              `UPDATE db_employees.employee SET flag = 0 WHERE email = (?) `,
              greetings[j].email,
              function(err, result, field) {
                if (!err) {
                  console.log(result);
                } else {
                  console.log(err);
                }
              }
            );
          }, 50000); //86400000
        });
      }
    }
  }
}

//send mail to those in notification array at 8 AM as per their time zone
//if time there > 8 send mail immediately
async function sendNotificationMail(notification) {
  for (let k = 0; k < notification.length; k++) {
    var d = new Date();
    utc = d.getTime() + d.getTimezoneOffset() * 60000;
    nd3 = new Date(utc + 3600000 * notification[k].offset);

    if (nd3.getHours() < 8) {
      if (nd.getHours() + "-" + nd.getMinutes() == "17-32") {
        mail2(notification[k]);
      }
    } else {
      mail2(notification[k]);
    }

    function mail2(notification) {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        port: 25,
        auth: {
          user: YOUR_EMAIL,
          pass: YOUR_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      let HelperOptions = {
        from: '"Neha negi" <YOUR_EMAIL> ',
        to: notification.email,
        subject: "Send Email Using Node.js",
        text: `Hey! Don't forget to wish ${notification.event_owner}  for his/her ${notification.event_name}. contact through mail ${notification.event_address}`
      };

      transporter.sendMail(HelperOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("the message was sent");
        console.log(info);
        notification = notification.splice(k, 1);
      });
    }
  }
}

module.exports = {
  sendGreetingMail,
  sendNotificationMail
};
