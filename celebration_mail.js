
var mysql = require('mysql');
var nodemailer = require('nodemailer');
 
 
//CREATING CONNECTION WITH MYSQL DATABASE
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "put database_password",
    database: "databasename"
});
 
setTimeout(() => {
    connectDb().then(async(resobj) => {
        var res; //variable to store query result
        var flag;
        var greetings = [];
        var notified = [];
        var subscribers = [];
        var choice_each;
        console.log("resobj length is" + resobj.length);
 
        //match dob with today date of all rows
 
        for (i = 0; i < resobj.length; i++) {
            // timezone
 
            var d = new Date();
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
 
            // create new Date object for different city
            // using supplied offset
 
            var nd = new Date(utc + (3600000 * resobj[i].offset));
 
            if ((resobj[i].MONTH == (nd.getMonth() + 1)) && (resobj[i].DAY == nd.getDate())) {
 
                //1.if resobj[i] special date matched with their today's date, push to array greetings
                //2.for each entry in greeting loop through all other data.....
                console.log(" birth date matched for employee_id " + resobj[i].employee_id);
                console.log(resobj[i].employee_id);
                greetings.push(resobj[i]);
                console.log("pushed to greetings"+ resobj[i].employee_id);
                console.log("greetings array is:");
                console.log(greetings);
 
 
                        //push all those in array subscribers,who has subscribed for resobj[i]
                        //choices_data contains subscriptions,blacklist etc details
 
                        let choices_data = await choice();
                        console.log("choices_data is");
                        console.log(choices_data);
                        subscribers = [];
                        for (let c = 0; c < choices_data.length; c++) {
                            if (choices_data[c].subscriptions == resobj[i].email) {
                                subscribers.push(choices_data[c]);
                            }
                        }
                        console.log("the person who subscribed to" + resobj[i].email + "are:");
                        console.log(subscribers);
                        console.log("subscribers length is " + subscribers.length);
 
                        //prom3 checks if subscribers array has any entry which is on blacklist by resobj[i]
                        await prom3(resobj[i], subscribers,notified).then();
                   // }
              //  }
            }
        }
 
        //CHECK IF THERE IS SOMEONE WHO HAS SPECIAL MOMENT TODAY i.e ANY ENTRY IN GREETINGS ARRAY
        //IF YES
        //MATCH THEIR LOCAL TIME WITH 8 AM for those in array greeting
        // SEND MAIL if time matched
        //PUT FLAG = 1
        //notify others
       if (greetings.length != 0) {
            for (let j = 0; j < greetings.length; j++) {
                var nd2 = new Date(utc + (3600000 * greetings[j].offset));
               if (nd2.getHours() + "-" + nd2.getMinutes() == "18-00")
              
               {
                    //send mail to those in greetings array
                    let transporter = nodemailer.createTransport({
                        service: 'gmail',  
                        secure: false,
                        port: 25,
                        auth: {
                            user: 'putyourmailacc@gmail.com',
                            pass: 'yourpassword'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
 
                    });
 
 
                    let HelperOptions =
                    {
                        from: '"your name" <putyourmailacc@gmail.com> ',
                        to: greetings[j].email,
                        subject: "Send Email Using Node.js",
                        text: `CONGRATULATIONS ${greetings[j].first_name} for your ${greetings[j].event_name}.`,
 
                    };
 
                    transporter.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log("the message was sent");
                        console.log(info);
                        connection.query(`UPDATE employee SET flag = 1 WHERE email = (?) `, greetings[j].email, function (err, result, field) {
                            if (!err) {
                                console.log("no error in set flag");
                                console.log(result);
                            }
                            else {
                                console.log("no error in set flag");
                                console.log(err);
                            }
                        });
 
                        setTimeout(function () {
                            connection.query(`UPDATE employee SET flag = 0 WHERE email = (?) `, greetings[j].email, function (err, result, field) {
                                if (!err) {
                                    console.log(result);
                                }
                                else {
                                    console.log(err);
                                }
                            });
                        },60000) //86400000
                    });
                }
            }
        }
 
 
            //send mail to those in notified array at 8 AM as per their time zone
            //if time there > 8 send mail immediately
 
 
           for (let k = 0; k < notified.length; k++) {
                utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                nd3 = new Date(utc + (3600000 * notified[k].offset));
 
                if (nd3.getHours() < 8) {
                    if (nd.getHours() + "-" + nd.getMinutes() == "17-32") {
                        mail2(notified[k]);
                    }
                }
                else {
                    mail2(notified[k]);
                }
 
                function mail2(notified) {
                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        secure: false,
                        port: 25,
                        auth: {
                            user: 'putyourmailacc@gmail.com',
                            pass: 'yourpassword'
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
 
                    });
                    let HelperOptions =
                    {
                        from: '"your name" <putyourmailacc@gmail.com> ',
                        to: notified.email,
                        subject: "Send Email Using Node.js",
                        text: `Hey! Don't forget to wish ${notified.event_owner}  for his/her ${notified.event_name}. contact through mail ${notified.event_address}`,
 
                    };
 
                    transporter.sendMail(HelperOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log("the message was sent");
                        console.log(info);
                    });
 
                }
           }
        
 
    })
    .catch(err => {
        console.log("res err");
        console.log(err);
    });
}, 5000);
 
function connectDb() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT MONTH(employee.event_date) AS MONTH , employee_id, DAY(employee.event_date) AS DAY, offset , event_name, first_name,email, flag from employee `, function (err, result, field) {
            if (!err) {
                resolve(result);
            }
            else {
                console.log(err);
            }
        });
    });
}
 
    function  choice() {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT choices.* , employee.email, employee.employee_id FROM employee JOIN choices  ON employee.employee_id = choices.employee_id  WHERE choices.employee_id = employee.employee_id `, function (err, result, field) {
            if (!err) {
                console.log('inside promise "choice"');
                resolve(result);
            }
            else {
                console.log(err, 'choice err');
            }
        });
    });
}
 
function choice_each(resobj2) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT id, blacklist, event_name,first_name,subscriptions, email from employee LEFT JOIN choices ON employee.employee_id = choices.employee_id  WHERE choices.employee_id = (?)`, resobj2.employee_id, function (err, result, field) {
            if (!err) {
                console.log("choice_each result is:");
                console.log(result);
                resolve(result);
            }
            else {
                console.log(err);
            }
        });
    })
}
 
 
 
////prom3 checks if subscribers array has any entry which is on blacklist by resobj[i]
//if not then push them to array notified
function prom3(resobj2, subscribers,notified) {
    //choice_each contains all rows with employee_id that of resobj[i] from table choices
    //i.e subscriptions and blacklist of resobj[i]
    return choice_each(resobj2).then(choice_eachobj => {
 
        //check if resobj blacklist == subscribers
        console.log("object inside prom 3 choiceeach.then is:");
        console.log(resobj2);
        console.log("subscribers are");
        console.log(subscribers);
        console.log('pushING to array notified');
        console.log("choiceeach len:"+choice_eachobj.length);
        console.log("subscribers len is "+subscribers.length);
 
            var temp =0;
            for (let e = 0; e < subscribers.length ; e++) {
                console.log("inside first loop");
                for (let d = 0; d <choice_eachobj.length; d++) 
                {
                    console.log("inside 2nd for loop");
                    console.log(subscribers);
                    console.log(subscribers[e].email);
                    console.log("notified array is:");
                    console.log(notified);
                    if(subscribers[e].email == choice_eachobj[d].blacklist )
                    {
                        temp = 1;
                        console.log("condition");
                        break;
                        
                    }
                }
                    
                    if(temp == 0)
                    {
                      //  push to array notified
                         subscribers[e].event_owner = choice_eachobj[0].first_name;
                         subscribers[e].event_name = choice_eachobj[0].event_name;
                         subscribers[e].event_address = choice_eachobj[0].email;
                         notified.push(subscribers[e]);
                        console.log('pushed to array notified');
                        console.log(notified);
                    }
                   
                   
     
                }
        
    });
    

}//END OF PROM3
 
console.log("...");