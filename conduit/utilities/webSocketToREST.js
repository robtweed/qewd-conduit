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

  01 October 2020

  Converts a WebSocket message to a REST request

*/

let apis = {};

module.exports = function(messageObj, finished) {

  if (!apis[messageObj.type]) {
    apis[messageObj.type] = require('../../apis/' + messageObj.type);
  }
  const api = apis[messageObj.type];

  let args = {
    req: {
      headers: {},
      query: messageObj.query,
      body: messageObj.body
    }
  };
  if (messageObj.JWT) {
    args.req.headers.authorization = 'Token ' + messageObj.JWT;
  }
  if (messageObj.params) {
    let name;
    for (name in messageObj.params) {
      args[name] = messageObj.params[name];
    }
  }
  api.call(this, args, finished);
};


