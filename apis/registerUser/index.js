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

const validation = require('../../conduit/utilities/validation');
const errorHandler = require('../../conduit/utilities/errorHandler');
const registerUser = require('../../conduit/users/registerUser');

module.exports = function(args, finished) {

  // validate request object...

  // check for body and required fields

  let errors = validation.bodyAndFields(args, 'user', ['username', 'email', 'password']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  let body = args.req.body;
  let params = {
    username: body.user.username,
    email: body.user.email,
    password: body.user.password
  };

  let results = registerUser.call(this, params);
  if (results.error) {
    return errorHandler.errorResponse(results.error, finished);
  }
  finished(results);
};

 