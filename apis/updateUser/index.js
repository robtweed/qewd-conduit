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
const updateUser = require('../../conduit/user/updateUser');


module.exports = function(args, finished) {

  // Update User

  // first, validate request object...

  // check for body and optional fields

  let errors = validation.bodyAndFields(args, 'user', null, ['email', 'password', 'username']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  let params = args.req.body.user;

  // validate JWT and get the payload contents

  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let session = status.session;
  params.id = status.payload.id;
  params.currentUsername = status.payload.username;

  let results = updateUser.call(this, params, session);

  if (results.error) {
    return errorHandler.errorResponse(results.error, finished);
  }
  finished(results);
};
