/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017-20 M/Gateway Developments Ltd,                        |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  29 September 2020

*/

const db = require('../db/objects');
const getUser = require('./getUser');
const errorHandler = require('../utilities/errorHandler');
const emailValidator = require('email-validator');

function authenticate(args, session) {

  let errors = {};
  let email = args.email;
  let password = args.password;

  if (!email || email === '') {
    errors = errorHandler.add('email', "is blank", errors);
  }
  if (!password || password === '') {
    errors = errorHandler.add('password', "is blank", errors);
  }
  console.log('*** errors = ' + JSON.stringify(errors));
  if (errorHandler.hasErrors(errors)) return {error: errors};

  // check that email is valid

  if (!emailValidator.validate(email) || email.length > 255) {
    errors = errorHandler.add('email', "is invalid", errors);
  }

  // check that password is valid

  if (password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }

  if (errorHandler.hasErrors(errors)) return {error: errors};

  // authenticate

  if (!db.users.authenticate.call(this, email, password)) {
    errors = errorHandler.add('email or password', "is invalid", errors);
    return {error: errors};
  }

  // Start new Session, create JWT and return User

  let id = db.users.idByEmail.call(this, email);
  let user = getUser.call(this, id, session);  // starts new session

  return ({user: user})
}

module.exports = authenticate;
