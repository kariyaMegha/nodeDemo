
const dotenv = require("dotenv").config(),
    jwt = require("jsonwebtoken");

let jwt_key = process.env.jwt_key,
    jwt_expiry = process.env.jwt_expiry;

/* create Auth token*/
exports.createAuthToken = function (data, callback) {

    let response = {};
    try {
        let token = jwt.sign({
                data: data
            },
            jwt_key,
            {expiresIn: jwt_expiry},
            {algorithm: 'HS256'}
        );
        response.status = 0;
        response.token = token;
        callback(null, response);
    } catch (e) {
        response.status = 1;
        response.err = e.toString();
        callback(response);
    }
};

/* validate Auth token & decode it*/
exports.verifyAuthToken = function (data, callback) {

    let response = {};
    try {
        /* validate token*/
        let decode = jwt.verify(data.token, jwt_key, {algorithms: ['HS256']});

        /* token expiration check*/
        if (decode.exp >= Date.now()) {
            response.status = 1;
            response.message = "Token is expired";
            response.errCode = 1006;
            callback(response);
        } else if (typeof decode.data.userId == 'undefined' && decode.data.userId == '') {
            response.status = 9;
            response.message = "Invalid token";
            response.errCode = 1005;
            callback(response);
        } else {
            response.status = 0;
            response.data = decode.data;
            callback(null, response);
        }
    } catch (err) {

        if (err.name === 'TokenExpiredError') {
            response.status = 1;
            response.message = "Token is expired";
            response.errCode = 1006;
            callback(response);
        } else {
            response.status = 9;
            response.message = "Invalid token";
            response.errCode = 1005;
            callback(response);
        }
    }
};