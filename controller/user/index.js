const express = require('express'),
    router = express.Router(),
    md5 = require("md5"),
    randomString = require("randomstring")
    logHelper = require('../../helper/logHelper'),
    UserModel = require('../../models/Users/index'),
    validateUsers = require('../../validations/users'),
    jwt = require('../../helper/JWT');

let errorLog = logHelper.errorLog,
    writeLog = logHelper.writeLog,
    whiteListedMethod = ['/validateLogin', '/register'];

router.all("/*", function (req, res, next) {
    let Response;

    if(whiteListedMethod.indexOf(req.url) != -1) {
        next();
    } else {
        if (req.headers && req.headers.authorization && req.headers.authorization.split(" ").length > 1 && req.headers.authorization.split(" ")[0] == "JWT" && typeof req.headers.authorization.split(" ")[1] != 'undefined' && req.headers.authorization.split(" ")[1] != '') {
            let TokenData = {};
            try {
                TokenData.token = req.headers.authorization.split(" ")[1];
                /*Access token verification process*/
                jwt.verifyAuthToken(TokenData,function (err, verified) {
                    if (!err && verified.status == 0) {
                        req.body.userInfo = verified.data;
                        next();
                    } else {
                        Response = {
                            responseCode: 1,
                            errCode: err.errCode,
                            message: err.message,
                        }
                        return res.status(200).json(Response).end();
                    }
                });
            } catch (e) {
                Response = {
                    responseCode: 9,
                    errCode: 3001,
                    message: 'Internal Error',
                }
                return res.status(200).json(Response).end();
            }
        } else {
            Response = {
                responseCode: 9,
                errCode: 1005,
                message: 'Invalid auth token',
            }
            return res.status(200).json(Response).end();
        }
    }
});

/*
* Route : /v1/user/validateLogin
* Method Type : Post
* Request Body : uid,password
* Response : responseCode:1 = failed, responseCode:0 = success
* */
router.post('/validateLogin', function (req, res) {
    let Response;
    try {
        validateUsers.validateLoginRequest(req.body.data, function (err, validate) {
            if (!err) {
                if (validate.isValid) {
                    let password = req.body.data.password = md5(req.body.data.password);
                    let whereCondition = {
                        "email": req.body.data.email,
                        "password": password
                    }
                    UserModel.find(whereCondition).then(validUser => {

                        if (validUser.length) {
                            let responseData = {};
                            responseData.firstname = validUser[0].firstname;
                            responseData.lastname = validUser[0].lastname;
                            responseData.email = validUser[0].email;
                            responseData.userId = validUser[0].userId;

                            /*creating jwt token*/
                            jwt.createAuthToken(responseData, function (err, tokenData) {

                                if (tokenData && !tokenData.status) {
                                    responseData.jwt_token = tokenData.token;
                                    Response = {
                                        responseCode: 0,
                                        message: 'Login successful',
                                        errCode: 4003,
                                        data: {
                                            auth_token: tokenData.token
                                        }
                                    }
                                    writeLog(req.body, responseData, "validateLogin");
                                    res.status(200).json(Response);
                                } else {
                                    Response = {
                                        responseCode: 1,
                                        message: 'AuthToken generation fail',
                                        errCode: 3035,
                                        data: {}
                                    }
                                    writeLog(req.body, err, "validateLogin");
                                    res.status(200).json(Response);
                                }
                            });
                                
                        } else {
                            Response = {
                                responseCode: 1,
                                message: 'Userid and Password not match',
                                errCode: 3036,
                                data: {}
                            }
                            writeLog(req.body, validUser, "validateLogin");
                            res.status(200).json(Response);
                        }
                    }).catch(err => {
                        Response = {
                            responseCode: 9,
                            message: "Internal Error",
                            errCode: 3001
                        }
                        errorLog(err.toString(), "validateLogin");
                        res.status(500).json(Response);
                    });
                } else {
                    Response = {
                        responseCode: 1,
                        errCode: validate.errorCode,
                        message: validate.errors.message,
                        data: {}
                    }
                    return res.status(200).json(Response);
                }
            } else {
                Response = {
                    responseCode: 9,
                    message: "Internal Error",
                    errCode: 3001
                }
                errorLog(err.toString(), "validateLogin");
                return res.status(500).json(Response);
            }
        });
    } catch (err) {
        Response = {
            responseCode: 9,
            message: "Internal Error",
            errCode: 3001
        }
        errorLog(err.toString(), "validateLogin");
        return res.status(500).json(Response);
    }
});

/*
* Route : /v1/user/register
* Method Type : Post
* Request Body : user details
* Response : responseCode:1 = failed, responseCode:0 = success
* */
router.post('/register', function (req, res) {
    let Response;
    try {
        validateUsers.validateUserRequestInput(req.body.data, function (err, validate) {
            if (!err) {
                if (validate.isValid) {
                    let whereCondition = { email:req.body.data.email };
                    UserModel.find(whereCondition)
                    .then(existuser => {
                        if(existuser && existuser.length > 0) {
                            Response = {
                                responseCode: 1,
                                message: 'User already exist',
                                errCode: 3039
                            }
                            writeLog(req.body, Response, "register");
                            res.status(200).json(Response);
                        } else {
                            let userId = randomString.generate({length: 5,capitalization :"uppercase"});
                            let insertData = {
                                userId: userId,
                                firstname : req.body.data.firstname,
                                lastname : req.body.data.lastname,
                                password: md5(req.body.data.password),
                                email : req.body.data.email
                            }
                            let userRequest = new UserModel(insertData)
                            userRequest.save()
                            .then(data => {
                                if(data){
                                    Response = {
                                        responseCode: 0,
                                        message: 'User registered successfully',
                                        errCode: 4004
                                    }
                                    writeLog(req.body, Response, "register");
                                    res.status(200).json(Response);
                                } else {
                                    Response = {
                                        responseCode: 1,
                                        message: 'User registration failed',
                                        errCode: 3037
                                    }
                                    writeLog(req.body, Response, "register");
                                    res.status(200).json(Response);
                                }
                        
                            }).catch(err => {
                                Response = {
                                    responseCode: 9,
                                    message: "Internal Error",
                                    errCode: 3001
                                }
                                errorLog(err.toString(), "register");
                                res.status(500).json(Response);
                            });
                        }
                    }).catch(err => {
                        Response = {
                            responseCode: 9,
                            message: "Internal Error",
                            errCode: 3001
                        }
                        errorLog(err.toString(), "register");
                        return res.status(500).json(Response);
                    });

                } else {
                    Response = {
                        responseCode: 1,
                        errCode: validate.errorCode,
                        message: validate.errors.message,
                        data: {}
                    }
                    return res.status(200).json(Response);
                }
            } else {
                Response = {
                    responseCode: 9,
                    message: "Internal Error",
                    errCode: 3001
                }
                errorLog(err.toString(), "register");
                return res.status(500).json(Response);
            }
        });
    } catch (err) {
        Response = {
            responseCode: 9,
            message: "Internal Error",
            errCode: 3001
        }
        errorLog(err.toString(), "register");
        return res.status(500).json(Response);
    }
});

/*
* Route : /v1/user/getUsers
* Method Type : Get
* Request Body : {}
* Response : responseCode:1 = failed, responseCode:0 = success
* */
router.get('/getUsers', function (req, res) {
    let Response;
    try {
        let selectData = {_id:false};
        UserModel.find({},selectData)
        .then(data => {
            if(data && data.length > 0){
                Response = {
                    responseCode: 0,
                    message: 'Get users list successfully',
                    errCode: 4005,
                    data: data
                }
                writeLog(req.body, Response, "getUsers");
                res.status(200).json(Response);
            } else {
                Response = {
                    responseCode: 1,
                    message: 'No records found',
                    errCode: 3038,
                    data: {}
                }
                writeLog(req.body, Response, "getUsers");
                res.status(200).json(Response);
            }
        
        }).catch(err => {
            Response = {
                responseCode: 9,
                message: "Internal Error",
                errCode: 3001
            }
            errorLog(err.toString(), "getUsers");
            res.status(500).json(Response);
        });
               
    } catch (err) {
        Response = {
            responseCode: 9,
            message: "Internal Error",
            errCode: 3001
        }
        errorLog(err.toString(), "getUsers");
        return res.status(500).json(Response);
    }
});

/*
* Route : /v1/user/getUsers
* Method Type : Post
* Request Body : user details
* Response : responseCode:1 = failed, responseCode:0 = success
* */
router.get('/getUserById/:userId', function (req, res) {
    let Response;
    try {
        validateUsers.validateGetUserByIdInput(req.params, function (err, validate) {
            if (!err) {
                if (validate.isValid) {
                    let whereCondition = {
                        "userId": req.params.userId
                    }
                    let selectData = { _id: false};
                    UserModel.findOne(whereCondition, selectData).then(data => {

                        if (data && Object.keys(data).length) {
                            Response = {
                                responseCode: 0,
                                message: 'Login successful',
                                errCode: 4006,
                                data: data
                            }
                            writeLog(req.body, Response, "getUserById");
                            res.status(200).json(Response);
                        } else {
                            Response = {
                                responseCode: 1,
                                message: 'Userid and Password not match',
                                errCode: 3040,
                                data: {}
                            }
                            writeLog(req.body, validUser, "getUserById");
                            res.status(200).json(Response);
                        }
                    }).catch(err => {
                        Response = {
                            responseCode: 9,
                            message: "Internal Error",
                            errCode: 3001
                        }
                        errorLog(err.toString(), "getUserById");
                        res.status(500).json(Response);
                    });
                } else {
                    Response = {
                        responseCode: 1,
                        errCode: validate.errorCode,
                        message: validate.errors.message,
                        data: {}
                    }
                    return res.status(200).json(Response);
                }
            } else {
                Response = {
                    responseCode: 9,
                    message: "Internal Error",
                    errCode: 3001
                }
                errorLog(err.toString(), "getUserById");
                return res.status(500).json(Response);
            }
        });
               
    } catch (err) {
        Response = {
            responseCode: 9,
            message: "Internal Error",
            errCode: 3001
        }
        errorLog(err.toString(), "getUserById");
        return res.status(500).json(Response);
    }
});

module.exports = router;