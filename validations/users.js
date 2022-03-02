const Validator = require('validator');

/* validate login inputs*/
exports.validateLoginRequest = function (data, callback) {
    let errors = {};
    let errorCode;
    try {
        if (typeof data === "undefined" || data == '') {
            errors.message = 'Invalid request. Please Try again';
            errorCode = 1002;
        } else {
            if (typeof data.email === 'undefined' || data.email === '') {
                errors.message = 'Please provide email';
                errorCode = 1003;
            } else if (!(Validator.isEmail(data.email) || Validator.isMobilePhone(data.email, locale))) {
                errors.message = 'Please provide valid email';
                errorCode = 1004;
            } else if (typeof data.password === 'undefined' || data.password === '') {
                errors.message = 'Please provide password';
                errorCode = 1005;
            } else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/.test(data.password)) {
                errors.message = 'Password must contain at-least 1 uppercase, 1 lowercase, 1 number and 1 special character.';
                errorCode = 1006;
            }
        }
        callback(null, {
            errors,
            errorCode: errorCode,
            isValid: Object.keys(errors).length > 0 ? false : true
        });
    } catch (e) {
        callback(e.toString());
    }
}

/* validate user registration inputs*/
exports.validateUserRequestInput = function (data, callback) {
    let errors = {};
    let errorCode;
    try {
        if (typeof data === "undefined") {
            errors.message = 'Invalid request. Please Try again';
            errorCode = 1002;
        } else {
            if (typeof data.firstname === 'undefined' || data.firstname === '') {
                errors.message = 'Please provide first name';
                errorCode = 1009;
            } else if (!Validator.isAlpha(data.firstname)) {
                errors.message = 'Invalid first name';
                errorCode = 1010;
            } else if (typeof data.lastname === 'undefined' || data.lastname === '') {
                errors.message = 'Please provide last name';
                errorCode = 1011;
            } else if (!Validator.isAlpha(data.lastname)) {
                errors.message = 'Invalid last name';
                errorCode = 1012;
            } else if (typeof data.email === 'undefined' || data.email === '') {
                errors.message = 'Please provide email';
                errorCode = 1013;
            } else if (!Validator.isEmail(data.email)) {
                errors.message = 'Invalid email address';
                errorCode = 1014;
            } else if (typeof data.password === 'undefined' || data.password === '') {
                errors.message = 'Please provide password';
                errorCode = 1015;
            } else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/.test(data.password)) {
                errors.message = 'Password must contain at-least 1 uppercase, 1 lowercase, 1 number and 1 special character.';
                errorCode = 1016;
            } 
            callback(null, {
                errors,
                errorCode: errorCode,
                isValid: Object.keys(errors).length > 0 ? false : true
            });
                
        }
    } catch (e) {
        callback(e.toString());
    }
};

/* Validation for Get user By ID */
exports.validateGetUserByIdInput = function (data,callback) {
	let errors = {};
	let errorCode;

	try{
		if (typeof data.userId == undefined || !data.userId || data.userId == "" || data.userId.length == 0 || Validator.isEmpty(data.userId + '')) {
			errors.message = 'User Id is required';
			errorCode = 1017;
		} else if (!Validator.isAlphanumeric(data.userId + '')) {
			errors.message = 'Please enter valid User Id';
			errorCode = 1018;
		} else if (!Validator.isLength(data.userId + '', { min: 5, max: 5 })) {
			errors.message = 'User Id must be of 5 characters';
			errorCode = 1019;
		}
		callback(null,{errors,errorCode:errorCode,isValid: Object.keys(errors).length > 0 ? false : true});
		
	} catch(e){
		callback(e.toString(),null);
	}
};