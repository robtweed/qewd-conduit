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

  // Delete Comment

  // validate JWT and if OK, get the user database pointer

  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let id = status.payload.id;

  // if slug exists, get pointer to article

  let slug = args.slug;
  let articleId = db.articles.getIdBySlug.call(this, slug);
  if (!articleId) {
    // no article with that slug
    return errorHandler.notFound(finished);
  }

  // next get the pointer to the comment within that article

  let commentId = args.id;

  if (!db.comments.exists.call(this, commentId)) {
    // no comment with that Id in the article
    return errorHandler.notFound(finished);
  }

  // is the current user the author of the comment?

  if (db.comments.getAuthor.call(this, commentId) !== id) {
    let errors = errorHandler.add('comment', "not owned by author");
    return errorHandler.errorResponse(errors, finished, 403);
  }

  // ok, delete the comment

  db.comments.del.call(this, commentId);
  finished({});
};
