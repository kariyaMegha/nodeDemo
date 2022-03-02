const dotenv = require("dotenv").config(),
    mongoose = require("mongoose"),
    dateFormat = require("dateformat"),
    fs = require("fs");
let mongoDB = mongoose.connection,
    timeout = 100,
    limit = 10,
    counter = 0;

// Mongo Connection
function MongoDBConnection() {
    try{
        if (mongoose.connection.readyState === 0 && mongoose.connection.readyState !== 2 && mongoose.connection.readyState !== 1) {
            let mongoDBConnectionOption = {
                auto_reconnect: true,
                autoIndex: false,
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
                useCreateIndex: true
            }
            mongoose.connect(process.env.mongoURL, mongoDBConnectionOption)
        }
    }catch(e){

    }

}
mongoDB.on('connected', function(){

    timeout = 100;
    counter = 0;
});
mongoDB.on('error', function (error) {
    let ErrorLogFile = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/DBConnectionErrorlog_' + dateFormat(new Date(), "dd-mm-yyyy") + '.log';
    let LogString = '===================== Database Connection Error ======================\n';
    LogString += 'DateTime : ' + new Date() + '\n\n\r';
    LogString += 'Exception : ' + error.toString() + '\n\n\r';
    fs.appendFile(ErrorLogFile, LogString, "utf8", function (err) {
        if (err) {
        }
    });
});
// handle disconnect event in mongodb
mongoDB.on('disconnected', function () {

    counter++;
    if(counter == 0){
        setTimeout(MongoDBConnection, timeout);
    }else if(counter !== limit){
        timeout = timeout * 2;
        setTimeout(MongoDBConnection, timeout);
    }else {
        let ErrorLogFile = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/DBConnectionErrorlog_' + dateFormat(new Date(), "dd-mm-yyyy") + '.log';
        let LogString = '===================== Reconnect Attempts Are Reached to Limit ======================\n';
        LogString += 'DateTime : ' + dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss:l TT") + '\n\n\r';
        fs.appendFile(ErrorLogFile, LogString, "utf8", function (err) {
            if (err) {
            }
        });
    }
});
exports.ConnectMongoDB = function () {
    MongoDBConnection();
};