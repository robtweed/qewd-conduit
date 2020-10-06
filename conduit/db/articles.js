/*
 ----------------------------------------------------------------------------
 | qewd-conduit: QEWD Implementation of the Conduit Back-end                |
 |                                                                          |
 | Copyright (c) 2017-2020 M/Gateway Developments Ltd,                      |
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

  5 October 2020

*/

const slugify = require('slugify');
const db = {
  users: require('./users'),
  comments: require('./comments')
};

function getNextId() {
  return this.db.use('conduitArticles', 'nextId').increment();
}

function articleExists(articleId) {
  return this.db.use('conduitArticles', 'byId', articleId).exists;
}

function getAuthor(articleId) {
  return this.db.use('conduitArticles', 'byId', articleId, 'author').value;
}

function slugExists(slug) {
 return this.db.use('conduitArticles', 'bySlug', slug).exists;
}

function createSlug(title, articleId) {
  let slug = slugify(title).toLowerCase();
  if (slugExists.call(this, slug)) {
    slug = slug + '-x' + articleId;
  }
  return slug;
}

function create(authorId, data) {

  let articleId = getNextId.call(this);

  // derive a unique slug based on title

  let slug = createSlug.call(this, data.title, articleId);

  let now = new Date();
  let iso = now.toISOString();
  // get reverse chronological index timestamp value
  let ts = 100000000000000 - now.getTime();

  let article = {
    title: data.title,
    description: data.description,
    body: data.body,
    tagList: data.tagList,
    createdAt: iso,
    updatedAt: iso,
    timestampIndex: ts,
    favoritesCount: 0,
    author: authorId,
    slug: slug
  };

  // save to database

  let articlesDoc = this.db.use('conduitArticles');

  articlesDoc.$(['byId', articleId]).setDocument(article);

  // create indices

  articlesDoc.$(['bySlug', slug]).value = articleId;
  articlesDoc.$(['byAuthor', authorId, articleId]).value = articleId;
  articlesDoc.$(['byTimestamp', ts]).value = articleId;

  if (article.tagList) {
    article.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).value = articleId;
    });
  }
  return articleId;
}

function del(articleId) {

  let _this = this;

  if (!articleExists.call(this, articleId)) return;

  let articlesDoc = this.db.use('conduitArticles');
  let articleDoc = articlesDoc.$(['byId', articleId]);

  // delete slug index

  let slug = articleDoc.$('slug').value;
  articlesDoc.$(['bySlug', slug]).delete();

  // delete author index

  let authorId = getAuthor.call(this, articleId);
  articlesDoc.$(['byAuthor', authorId, articleId]).delete();

  // delete timestamp index

  let ts = articleDoc.$('timestampIndex').value;
  articlesDoc.$(['byTimestamp', ts]).delete();

  // delete tagList indices

  let tagList = articleDoc.$('tagList').getDocument(true);
  if (tagList && Array.isArray(tagList)) {
    tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).delete();
    });
  }

  // delete any associated comment records

  articleDoc.$('comments').forEachChild(function(commentId) {
    db.comments.del.call(_this, commentId, false);
  });

  // finally, delete article record

  articleDoc.delete();
}

function getTags() {
  let tags = [];
  let tagsDoc = this.db.use('conduitArticles', 'byTag');
  tagsDoc.forEachChild(function(tag) {
    tags.push(tag);
  });
  return tags;
}

function getIdBySlug(slug) {
  let slugIndex = this.db.use('conduitArticles', 'bySlug', slug);
  if (!slugIndex.exists) {
    return false;
  }
  return slugIndex.value;
}

function getFeed(userId, offset, max) {

  let followsDoc = this.db.use('conduitUsers', 'byId', userId, 'follows');
  let articlesDoc = this.db.use('conduitArticles');
  let articlesAuthorIndex = articlesDoc.$('byAuthor');
  let _this = this;

  // use a temporary global storage document for easy sorting by timestamp
  let tempDoc = this.db.use('conduitTemp', process.pid);
  tempDoc.delete();  // clear down just in case

  // get articles written by user's followed users
  let total = 0;
  let allFound = false;
  let skipped = 0;
  let count = 0;
  followsDoc.forEachChild(function(followsId) {
    articlesAuthorIndex.$(followsId).forEachChild(function(articleId) {
      total++;
      if (!allFound) {
        if (offset > 0 && skipped < offset) {
          skipped++;
        }
        else {
          let ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
           // add to temporary index by reverse timestamp
          tempDoc.$(ts).value = articleId;
          count++;
          if (count === max) allFound = true;
        }
      }
    });
  });

  // now spin through the temporary document to pull out articles latest first

  let articles = [];
  tempDoc.forEachChild(function(ts, childNode) {
    let article = get.call(_this, childNode.value, userId);
    articles.push(article);
  });

  tempDoc.delete();  // we're done with the temporary document, so delete it

  return {
    articles: articles,
    articlesCount: total
  };
}

function get(articleId, byUserId) {
  let articlesDoc = this.db.use('conduitArticles', 'byId', articleId);
  let article = articlesDoc.getDocument(true);
  if (!article.tagList) article.tagList = [];
  delete article.timestampIndex;
  delete article.comments;
  article.favorited = db.users.favorited.call(this, byUserId, articleId);
  article.author = db.users.getProfile.call(this, article.author, byUserId);
  article.favoritesCount = parseInt(article.favoritesCount);
  return article;
}

function byAuthor(username, byUserId, offset, max) {
  let userId = db.users.idByUsername.call(this, username);
  if (userId === '') return {error: 'notFound'};

  // use a temporary global storage document for easy sorting by timestamp
  let tempDoc = this.db.use('conduitTemp', process.pid);
  tempDoc.delete();  // clear down just in case

  let articlesDoc = this.db.use('conduitArticles');

  let total = 0;
  let allFound = false;
  let skipped = 0;
  let count = 0;
  articlesDoc.$(['byAuthor', userId]).forEachChild(function(articleId) {
    total++;
    if (!allFound) {
      if (offset > 0 && skipped < offset) {
        skipped++;
      }
      else {
        let ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
         // add to temporary index by reverse timestamp
        tempDoc.$(ts).value = articleId;
        count++;
        if (count === max) allFound = true;
      }
    }
  });

  // now spin through the temporary document to pull out articles latest first
  let articles = [];
  let _this = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      let article = get.call(_this, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: total
  };
}

function byTag(tag, byUserId, offset, max) {

  // use a temporary global storage document for easy sorting by timestamp
  let tempDoc = this.db.use('conduitTemp', process.pid);
  tempDoc.delete();  // clear down just in case

  let articlesDoc = this.db.use('conduitArticles');

  let total = 0;
  let allFound = false;
  let skipped = 0;
  let count = 0;
  articlesDoc.$(['byTag', tag]).forEachChild(function(articleId) {
    total++;
    if (!allFound) {
      if (offset > 0 && skipped < offset) {
        skipped++;
      }
      else {
        let ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
        // add to temporary index by reverse timestamp
        tempDoc.$(ts).value = articleId;
        count++;
        if (count === max) allFound = true;
      }
    }
  });

  // now spin through the temporary document to pull out articles latest first
  let articles = [];
  let _this = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      let article = get.call(_this, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: total
  };
}

function favoritedBy(username, byUserId, offset, max) {

  let userId = db.users.idByUsername.call(this, username);
  if (userId === '') return {error: 'notFound'};

  // use a temporary global storage document for easy sorting by timestamp
  let tempDoc = this.db.use('conduitTemp', process.pid);
  tempDoc.delete();  // clear down just in case

  let articlesDoc = this.db.use('conduitArticles');
  let favDoc = this.db.use('conduitUsers', 'byId', userId, 'favorited');

  let total = 0;
  let allFound = false;
  let skipped = 0;
  let count = 0;
  favDoc.forEachChild(function(articleId) {
    total++;
    if (!allFound) {
      if (offset > 0 && skipped < offset) {
        skipped++;
      }
      else {
        let ts = articlesDoc.$(['byId', articleId, 'timestampIndex']).value;
         // add to temporary index by reverse timestamp
        tempDoc.$(ts).value = articleId;
        count++;
        if (count === max) allFound = true;
      }
    }
  });

  // now spin through the temporary document to pull out articles latest first
  let articles = [];
  let _this = this;

  if (tempDoc.exists) {
    tempDoc.forEachChild(function(ts, childNode) {
      let article = get.call(_this, childNode.value, byUserId);
      articles.push(article);
    });

    tempDoc.delete();  // we're done with the temporary document, so delete it
  }

  return {
    articles: articles,
    articlesCount: total
  };
}

function latest(byUserId, offset, max) {

  let skipped = 0;
  let count = 0;
  let total = 0;
  let allFound = false;
  let _this = this;
  let articles = [];

  let articlesDoc = this.db.use('conduitArticles');

  articlesDoc.$('byTimestamp').forEachChild(function(ts, childNode) {
    total++;
    if (!allFound) {
      if (offset > 0 && skipped < offset) {
        skipped++;
      }
      else {
        let articleId = childNode.value;
        let article = get.call(_this, articleId, byUserId);
        articles.push(article);
        count++;
        if (count === max) {
          allFound = true;
        }
      }
    }
  });

  return {
    articles: articles,
    articlesCount: total
  };

}

function update(articleId, userId, newData) {

  let articlesDoc = this.db.use('conduitArticles');
  let articleDoc = articlesDoc.$(['byId', articleId]);

  let article = articleDoc.getDocument(true);

  let currentTitle = article.title;
  let currentSlug = article.slug;
  let newTitle = newData.title;

  // If title has changed, then update the slug index

  if (newTitle && newTitle !== currentTitle) {
    // remove the old slug index
    articlesDoc.$(['bySlug', currentSlug]).delete();
    //create and index a new slug

    let newSlug = createSlug.call(this, newTitle, articleId);

    articlesDoc.$(['bySlug', newSlug]).value = articleId;
    article.slug = newSlug;
    article.title = newTitle;
  }

  if (newData.description) article.description = newData.description;
  if (newData.body) article.body = newData.body;

  //update time stamp and reverse timestamp index

  let now = new Date();
  article.updatedAt = now.toISOString();

  // delete old index
  let ts = article.timestampIndex;
  articlesDoc.$(['byTimestamp', ts]).delete();
  // create new index
  ts = 100000000000000 - now.getTime();
  articlesDoc.$(['byTimestamp', ts]).value = articleId;
  article.timestampIndex = ts;

  //update tags

  if (newData.tagList) {
    // remove the current tags from the index
    if (article.tagList) {
      article.tagList.forEach(function(tag) {
        articlesDoc.$(['byTag', tag, articleId]).delete();
      });
    }

    // now update tags in article and create new taglist index

    article.tagList = newData.tagList;
    newData.tagList.forEach(function(tag) {
      articlesDoc.$(['byTag', tag, articleId]).value = articleId;
    });
  }

  // update main article database record

  articleDoc.setDocument(article);
}

module.exports = {
  byAuthor: byAuthor,
  byTag: byTag,
  get: get,
  create: create,
  del: del,
  update: update,
  favoritedBy: favoritedBy,
  getAuthor: getAuthor,
  getIdBySlug: getIdBySlug,
  getTags: getTags,
  latest: latest,
  getFeed: getFeed
};
