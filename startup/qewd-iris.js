/*

 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017 M/Gateway Developments Ltd,                           |
 | Reigate, Surrey UK.                                                      |
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

  30 April 2017

*/

// For front-ends, see:
//    https://github.com/gothinkster/realworld
//  eg to use the React/Redux version, follow the instructions here:
//    https://github.com/gothinkster/react-redux-realworld-example-app

// Make sure you have copied the appropriate nodexxx.iris file
//  from your IRIS /bin folder
//  to your QEWD folder's node_modules sub-folder
//   eg /opt/iris/bin/node800.iris (for Node.js v8.x)
//  and then rename it to node.iris

// start this back-end using:
//   sudo node qewd-iris

var config = {
  managementPassword: 'changeThisPassword!',
  serverName: 'QEWD/IRIS Conduit REST Server',
  port: 8080,
  poolSize: 2,
  database: {
    type: 'iris',
    params: {

      // change these as appropriate for your IRIS configuration:

      path: '/opt/iris/mgr',
      username: '_SYSTEM',
      password: 'SYS',
      namespace: 'USER'
    }
  },
  cors: true
};

var routes = [
  {
    path: '/api',
    module: 'qewd-conduit',
    errors: {
      notfound: {
        text: 'Resource Not Recognised',
        statusCode: 404
      }
    }
  }
];

var qewd = require('qewd').master;
qewd.start(config, routes);
