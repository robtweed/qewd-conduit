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

  27 October 2020

*/

const errorHandler = require('./errorHandler');
const db = require('../db/objects');
const jwt_simple = require('jwt-simple');
var uuid = require('uuid/v4');

function isEmptyObject(obj) {
  let name;
  for (name in obj) {
    return false;
  }
  return true;
}

function authenticate(args) {
  let auth = args.req.headers.authorization;
  if (!auth || auth === '') {
    return {
      error: 'Missing authorization',
      response: '',
      status: {
        code: '401'
      }
    };
  }

  let jwtToken = auth.split('Token ')[1];
  if (!jwtToken || jwtToken === '') {
    return {
      error: 'Missing JWT',
      response: '',
      status: {
        code: '401'
      }
    };
  }

  let payload;

  try {
    payload = jwt_simple.decode(jwtToken, null, true);
  }
  catch(err) {
    return {
      error: 'Invalid JWT: ' + err,
      status: {
        code: 401
      }
    };
  }
  if (!payload) {
    return {
      error: 'Missing JWT payload',
      status: {
        code: 401
      }
    };
  }
  if (payload.iss !== 'qewd:conduit') {
    return {
      error: 'Invalid JWT Issuer',
      status: {
        code: 401
      }
    };
  }
  if (!payload.email) {
    return {
      error: 'No email in JWT',
      status: {
        code: 401
      }
    };
  }

  let id = db.users.idByEmail.call(this, payload.email);

  if (!id) {
    return {
      error: 'Unrecognised email in JWT',
      status: {
        code: 401
      }
    };
  }

  // JWT is OK - allow the user to continue

  payload.id = id;
  return {
    payload: payload
  }
}

function bodyAndFields(args, category, requiredFields, optionalFields) {
  let errors = errorHandler.init();
  let body = args.req.body;

  if (isEmptyObject(body) || isEmptyObject(body[category])) {
    errors = errorHandler.add('body', "can't be empty", errors);
    return errors;
  }

  if (requiredFields && Array.isArray(requiredFields) && requiredFields.length > 0) {
    requiredFields.forEach(function(field) {
      if (typeof body[category][field] === 'undefined') {
        errors = errorHandler.add(field, "must be defined", errors);
      }
      else {
        if (body[category][field] === '') errors = errorHandler.add(field, "can't be empty", errors);
      }
    });
  }
  if (optionalFields && Array.isArray(optionalFields) && optionalFields.length > 0) {
    let noFields = true;
    optionalFields.forEach(function(field) {
      if (typeof body[category][field] !== 'undefined') {
        noFields = false;
        if (body[category][field] === '') {
          errors = errorHandler.add(field, "can't be blank", errors);
        }
      }
    });
    if (noFields) {
      errors = errorHandler.add('body', "doesn't contain any of the expected fields", errors);
    }
  }
  return errors;
}

function jwt(args) {
  // validate JWT, and if OK, payload and pointers to user document and user's specific document

  let status = authenticate.call(this, args);
  if (status.error) return status;

  let payload = status.payload;
  let session = status.session;

  // get the user id from the JWT payload

  let id = payload.id;
  if (id === '') {
    return {
      error: 'Unable to identify current user',
      status: {
        code: '403'
      }
    };
  }

  if (!db.users.exists.call(this, id)) {
    return {
      error: 'Unable to identify current user (2)',
      status: {
        code: '403'
      }
    };
  }
  
  return {
    payload: payload,
    session: session
  };
}

function createJWT(payload, secret, expiryTime, application) {
  // expiryTime is in seconds
  expiryTime = expiryTime || 5184000; // 60 days default
  application = application || 'conduit';
  if (!payload) return '';
  let now = Date.now();
  let iat = Math.floor(now/1000);
  payload.exp = iat + expiryTime;
  payload.iat = iat;
  payload.iss = 'qewd:' + application;
  payload.jti = uuid();
  
  var jwtToken = jwt_simple.encode(payload, secret);
  return jwtToken;
}


function decodeJWT(jwt) {
  let status = this.sessions.authenticateByJWT(jwt);
  if (status.error) return status;
  return status.payload;
}

function matches(string, pattern) {
  let regx = new RegExp(pattern);
  return regx.test(string);
}

module.exports = {
  isEmptyObject,
  authenticate,
  bodyAndFields,
  jwt,
  decodeJWT,
  matches,
  createJWT
};
