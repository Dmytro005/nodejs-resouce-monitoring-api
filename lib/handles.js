const _data = require('./data');
const helpers = require('./helpers');

// Define all the handlers
const handlers = {};

// Users handler
handlers.users = function(data, callback) {
    const acceptableMethods = ['post', 'put', 'get', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Contaier for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, tosAgreement, 
// Optional data: none
handlers._users.post = function(data, callback) {
    // Check all required fields

    let { firstName, lastName, phone, password, tosAgreement } = data.payload;

    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof(phone) == 'string' && phone.trim().length === 10 ? phone.trim() : false;
    password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false;
    tosAgreement = typeof(tosAgreement) == 'boolean' && tosAgreement === true ? true : false;


    if (firstName && lastName && phone && password && tosAgreement) {

        // Make sure that hte user dosen`t already exist
        _data.read('users', phone, function(err, data) {
            if (err) {
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    //Create suer object
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement: true
                    }

                    //Store the user
                    _data.create('users', phone, userObject, function(err, data) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.error(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    })

                } else {
                    callback(500, { 'Error': 'Could not hash the user`s password' });
                }

            } else {
                console.error(err);
                callback(400, { 'Error': 'User already exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing reqired fields' });
    }
}

// Users - get
// Required data: phone
handlers._users.get = function(data, callback) {
    // Check phone number is valid
    let { phone } = data.queryStringObject;

    phone = typeof(phone) == 'string' && phone.trim().length === 10 ? phone.trim() : false;

    if (phone) {
        _data.read('users', phone, function(err, data) {
            if(!err && data) {

                //Remove hashed password before sending it back
                delete data.hashedPassword

                callback(200, data);
            } else {
                callback(404);
            }
        })
    } else {
        callback(400, { 'Error': 'Missing reqired fields' });
    }
}

// Users - put
// Required data: phone
// Optional data: firstName, lastName, tosAgreement, password
handlers._users.put = function(data, callback) {

    let { phone, firstName, lastName, password } = data.payload;

    phone = typeof(phone) == 'string' && phone.trim().length === 10 ? phone.trim() : false;

    firstName = typeof(firstName) == 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof(lastName) == 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false;

    // If phone is valid
    if (phone) {
        // If at least one field is present
        if (firstName || lastName || password) {

            _data.read('users', phone, function(err, data){
                if (!err) {

                    if (firstName) {
                        data.firstName = firstName
                    }
                    if (lastName) {
                        data.lastName = lastName
                    }
                    if (password) {
                        data.password = helpers.hash(password)
                    }

                    _data.update('users', phone, data, function(err, data) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, { 'Error': 'Could not update the user' })
                        }
                    });

                } else {
                    callback(400, { 'Error': 'User was not found' })
                }
            })

        } else {
            callback(400, { 'Error': 'Missing field to update' });
        }

    } else {
        callback(400, { 'Error': 'Missing reqired fields' });
    }
}

// Users - delete
// Required data: phone
handlers._users.delete = function(data, callback) {
    // Check phone number is valid
    let { phone } = data.payload;

    phone = typeof(phone) == 'string' && phone.trim().length === 10 ? phone.trim() : false;

    if (phone) {
        _data.read('users', phone, function(err, data) {
            if(!err && data) {

                _data.delete('users', phone, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, 'Could not delete the specified user');
                    }
                })
            } else {
                callback(400, { 'Error': 'Could not find specified user' });
            }
        })
    } else {
        callback(400, { 'Error': 'Missing reqired fields' });
    }
}

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;
