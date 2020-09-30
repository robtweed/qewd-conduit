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
const db = require('../../conduit/db/objects');

module.exports = function(args, finished) {

  // optional authorization
  
  let byUserId;
  if (args.req.headers.authorization) {
    let status = validation.jwt.call(this, args);
    if (status.error) return finished(status);
    byUserId = status.payload.id;
  }

  let max = 20;
  if (args.req.query.limit) max = parseInt(args.req.query.limit);
  let offset = 0;
  if (args.req.query.offset) offset = parseInt(args.req.query.offset);

  // if no query string, list up to 20 most recent articles

  let results;
  if (args.req.query.author) {
    results = db.articles.byAuthor.call(this, args.req.query.author, byUserId, offset, max);
    return finished(results);
  }

  if (args.req.query.tag) {
    results = db.articles.byTag.call(this, args.req.query.tag, byUserId, offset, max);
    return finished(results);
  }

  if (args.req.query.favorited) {
    results = db.articles.favoritedBy.call(this, args.req.query.favorited, byUserId, offset, max);
    return finished(results);
  }

  // otherwise get latest articles for any author

  results = db.articles.latest.call(this, byUserId, offset, max);
  return finished(results);

};

