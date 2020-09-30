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

  // Delete Article

  // validate JWT

  let errors;
  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let username = status.payload.username;
  let id = status.payload.id;

  // check that the slug exists

  let slug = args.slug;
  let articleId = db.articles.getIdBySlug.call(this, slug);
  if (!articleId) {
    return errorHandler.notFound(finished);
  }

  //check that the user is the author

  let authorId = db.articles.getAuthor.call(this, articleId);

  if (authorId !== id) {
    errors = errorHandler.add('article', "not owned by author", errors);
    return errorHandler.errorResponse(errors, finished, 403);
  }

  // delete article

  db.articles.del.call(this, articleId);
  finished({});
};