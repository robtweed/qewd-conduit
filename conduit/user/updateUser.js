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

  21 October 2020

*/

const validation = require('../utilities/validation');
const errorHandler = require('../utilities/errorHandler');
const db = require('../db/objects');
const getUser = require('../user/getUser');
const emailValidator = require('email-validator');

function validImgURL(url) {
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function update(args, session) {

  let errors = {};
  let username = args.username;
  let email = args.email;
  let password = args.password;
  let id = args.id;
  let image = args.image;
  let currentUsername = args.currentUsername;

  // check that username is valid and doesn't already exist

  if (username) {
    if (!validation.matches(username, /^[a-zA-Z0-9]+$/) || username.length > 50) {
      errors = errorHandler.add('username', "is invalid", errors);
    }
    else {
      if (username !== username && db.users.usernameExists.call(this, username)) {
        errors = errorHandler.add('username', "has already been taken", errors);
      }
    }
  }

  // validate email

  let currentEmail = db.users.getEmail.call(this, id);

  if (email) {
    if (!emailValidator.validate(email) || email.length > 255) {
      errors = errorHandler.add('email', "is invalid", errors);
    }
    else {
      if (email !== currentEmail && db.users.emailExists.call(this, email)) {
        errors = errorHandler.add('email', "has already been taken", errors);
      }
    }
  }

  // check that password is valid

  if (password && password !== '' && password.length < 6) {
    errors = errorHandler.add('password', "must be 6 or more characters in length", errors);
  }

  // prevent XSS attempts via image

  if (image && image !== '') {

    if (!image.startsWith('http://') && !image.startsWith('https://')) {
      errors = errorHandler.add('picture_url', "is not a URL", errors);  
    }
    else if (!validImgURL(image)) {
      errors = errorHandler.add('picture_url', "is not a valid image URL", errors); 
    }
  }

  if (errorHandler.hasErrors(errors)) return {error: errors};

  // validation OK - register the new user

  db.users.update.call(this, id, {
    email: email,
    username: username,
    password: password,
    image: args.image,
    bio: args.bio
  });

  let user = getUser.call(this, id, session);

  return ({user: user});
}

module.exports = update;
