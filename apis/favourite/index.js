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

  // Favorite an Article

  // validate JWT

  let status = validation.jwt.call(this, args);
  if (status.error) return finished(status);
  let id = status.payload.id;

  // check that the slug exists

  let slug = args.slug;
  let articleId = db.articles.getIdBySlug.call(this, slug);
  if (!articleId) {
    // no article with that slug
    return errorHandler.notFound(finished);
  }

  // Note: can't favorite your own article

  if (id !== db.articles.getAuthor.call(this, articleId)) {

    // has user already favourited this article?

    if (!db.users.favorited.call(this, id, articleId)) {

      // record the favorite against the user

      db.users.favorite.call(this, id, articleId);
    }
  }

  // fetch the article object

  let article = db.articles.get.call(this, articleId, id);
  finished({article: article});
};
