const fs = require('fs'),
    dateFormat = require("dateformat"),
    mkdirp = require("mkdirp");


/* function name : write log
* Params : API request(Object), API Response (Object), Method Name (String) */
exports.writeLog = function (APIRequest, APIResponse, MethodName) {

    let LogFile = '';
    let LogDir = '';

    LogFile =  __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/ResponseLog/' + dateFormat(new Date(), "dd-mm-yyyy") + '/' + MethodName + '_' + dateFormat(new Date(), "dd-mm-yyyy_H") + '.log';
    LogDir = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/ResponseLog/' + dateFormat(new Date(), "dd-mm-yyyy")+ '/' ;

    let LogString = '';
    LogString += 'DateTime : ' + dateFormat(new Date(), "dd-mm-yyyy H:MM:ss") + ' \r\n';
    LogString += 'Method : ' + MethodName + ' \r\n';
    LogString += 'Request : ';
    LogString += JSON.stringify(APIRequest) + '\r\n';
    LogString += 'Response : \r\n';
    LogString += JSON.stringify(APIResponse) + '\r\n';

    /* check if DIR exist or not, else create it*/
    if (!fs.existsSync(LogDir)) {
        mkdirp(LogDir, function (err, result) {
            if (err) {

            } else if (result) {
                fs.appendFile(LogFile, LogString, "utf8", function (err) {
                    if (err) {

                    }
                });
            }
        });
    } else {
        fs.appendFile(LogFile, LogString, "utf8", function (err) {
            if (err) {

            }
        });
    }
            
    return true;
}

/* function name : Error Log
* Params : error (String), methodName (String) */
exports.errorLog = function (error, MethodName) {
    let LogFile ='';
    let LogDir = ''
    LogFile =  __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/ErrorLog/' + dateFormat(new Date(), "dd-mm-yyyy") + '/' + MethodName + '_' + dateFormat(new Date(), "dd-mm-yyyy_H") + '.log';
    LogDir = __dirname.substring(0, __dirname.indexOf("\\routes") + '\logs') + 'logs/ErrorLog/' + dateFormat(new Date(), "dd-mm-yyyy")+ '/';
    let LogString = '';
    LogString += 'DateTime : ' + dateFormat(new Date(), "dd-mm-yyyy H:MM:ss") + ' \r\n';
    LogString += 'Method : ' + MethodName + ' \r\n';
    LogString += 'Error : ';
    LogString += JSON.stringify(error) + '\r\n';

    /* check if DIR exist or not, else create it*/
    if (!fs.existsSync(LogDir)) {
        mkdirp(LogDir, function (err, result) {
            if (err) {
            } else if (result) {
                fs.appendFile(LogFile, LogString, "utf8", function (err) {
                    if (err) {

                    }
                });
            }
        });
    } else {
        fs.appendFile(LogFile, LogString, "utf8", function (err) {
            if (err) {

            }
        });
    }
            
    return true;
};
