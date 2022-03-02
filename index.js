const dotenv = require("dotenv").config(),
    http = require("http"),
    express = require("express"),
    dateFormat = require("dateformat"),
    app = express(),
    mongoDBConnectionHelper = require("./helper/dbHelper"),
    bodyParser = require("body-parser"),
    fs = require('fs'),
    user = require("./controller/user/index.js");

mongoDBConnectionHelper.ConnectMongoDB();
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));

app.use("/user",user);


/* If any uncaught exception generation that will handle here so node will not restart*/
process.on('uncaughtException', function (err) {
    console.log("1")
    let ErrorLogFile = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/UncaughtException' + dateFormat(new Date(), "dd-mm-yyyy") + '.log';
    let LogString = '===================== Uncaught Exception Error ======================\n';
    LogString += 'DateTime : ' + new Date() + '\n\n\r';
    LogString += 'Exception : ' + err.toString() + '\n\n\r';
    fs.appendFile(ErrorLogFile, LogString, "utf8", function (err) {
        if (err) {
        }
    });
});
process.on('unhandledRejection', function (err) {
    console.log("2",err)
    let ErrorLogFile = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/unhandledRejection' + dateFormat(new Date(), "dd-mm-yyyy") + '.log';
    console.log(ErrorLogFile);
    let LogString = '===================== Unhandled Rejection Warning ======================\n';
    LogString += 'DateTime : ' + new Date() + '\n\n\r';
    LogString += 'Exception : ' + err.toString() + '\n\n\r';
    fs.appendFile(ErrorLogFile, LogString, "utf8", function (err) {
        if (err) {
        }
    });
});
http.createServer({},app).listen(process.env.port,"0.0.0.0","",() => { console.log("server run at 8080")})