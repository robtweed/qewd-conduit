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

  // Create Article

  // first, validate request object...

  // check for body and optional fields

  let errors = validation.bodyAndFields(args, 'article', ['title', 'description', 'body']);
  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  let article = args.req.body.article;

  // validate title

  if (article.title !== '' && article.title.length > 255) {
    errors = errorHandler.add('title', "must be no longer than 255 characters", errors);
  }

  // validate description

  if (article.description !== '' && article.description.length > 255) {
    errors = errorHandler.add('description', "must be no longer than 255 characters", errors);
  }

  // validate tagList

  let tagList = article.tagList;
  if (typeof tagList !== 'undefined' && !Array.isArray(tagList)) {
    errors = errorHandler.add('tagList', "must be an array", errors);
  }

  if (errorHandler.hasErrors(errors)) return errorHandler.errorResponse(errors, finished);

  // validate JWT and if OK, get the user database pointer

  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let id = status.payload.id;

  // Save the article to the database

  let articleId = db.articles.create.call(this, id, article);

  // output article object

  article = db.articles.get.call(this, articleId, id);
  finished({article: article});
};
