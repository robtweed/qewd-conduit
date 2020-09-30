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

const db = {
  users: require('./users')
};


function getNextId() {
  return this.db.use('conduitComments', 'nextId').increment();
}

function exists(commentId) {
  return this.db.use('conduitComments', 'byId', commentId).exists;
}

function getAuthor(commentId) {
  return this.db.use('conduitComments', 'byId', commentId, 'author').value;
}

function linkComment(articleId, commentId) {

  // link a comment to its article record

  //new this.documentStore.DocumentNode('conduitArticles', ['byId', articleId, 'comments', commentId]).value = commentId;
  this.db.use('conduitArticles', 'byId', articleId, 'comments', commentId).value = commentId;
}

function unlinkComment(articleId, commentId) {

  // unlink a comment from its article record

  this.db.use('conduitArticles', 'byId', articleId, 'comments', commentId).delete();
}

function create(authorId, articleId, commentBody) {

  let commentsDoc = this.db.use('conduitComments');
  let commentId = getNextId.call(this);
  let iso = new Date().toISOString();

  let comment = {
    id: commentId,
    articleId: articleId,
    body: commentBody,
    author: authorId,
    createdAt: iso,
    updatedAt: iso
  };

  this.db.use('conduitComments', 'byId', commentId).setDocument(comment);

  // link to article

  linkComment.call(this, articleId, commentId);
  return commentId;
}

function del(commentId, unlinkArticle) {
  if (typeof unlinkArticle === 'undefined') unlinkArticle = true;
  let commentDoc = this.db.use('conduitComments', 'byId', commentId);
  let articleId = commentDoc.$('articleId').value;
  commentDoc.delete();
  if (unlinkArticle) unlinkComment.call(this, articleId, commentId);
}

function get(commentId, byUserId) {
  let commentDoc = this.db.use('conduitComments', 'byId', commentId);
  let comment = commentDoc.getDocument(true);
  delete comment.articleId;
  let ofUserId = comment.author;
  comment.author = db.users.getProfile.call(this, ofUserId, byUserId);
  return comment;
}

function byUser(userId, articleId) {

 let comments = [];

  // get comment records for the article

  let commentsDoc = this.db.use('conduitArticles', 'byId', articleId, 'comments');
  let _this = this;
  commentsDoc.forEachChild(function(commentId) {
    let comment = get.call(_this, commentId, userId);
    comments.push(comment);
  });
  return comments;
}

module.exports = {
  byUser: byUser,
  exists: exists,
  get: get,
  getAuthor: getAuthor,
  create: create,
  del: del
};
