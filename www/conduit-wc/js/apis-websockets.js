/*

 ------------------------------------------------------------------------------------
 | wc-conduit: RealWorld Conduit Application Client using mg_webComponents          |
 |                                                                                  |
 | Copyright (c) 2020 M/Gateway Developments Ltd,                                   |
 | Redhill, Surrey UK.                                                              |
 | All rights reserved.                                                             |
 |                                                                                  |
 | http://www.mgateway.com                                                          |
 | Email: rtweed@mgateway.com                                                       |
 |                                                                                  |
 |                                                                                  |
 | Licensed under the Apache License, Version 2.0 (the "License");                  |
 | you may not use this file except in compliance with the License.                 |
 | You may obtain a copy of the License at                                          |
 |                                                                                  |
 |     http://www.apache.org/licenses/LICENSE-2.0                                   |
 |                                                                                  |
 | Unless required by applicable law or agreed to in writing, software              |
 | distributed under the License is distributed on an "AS IS" BASIS,                |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.         |
 | See the License for the specific language governing permissions and              |
 |  limitations under the License.                                                  |
 ------------------------------------------------------------------------------------

  29 October 2020

*/

export function apis(context, QEWD) {

  context = context || {};

  let apis = {
    getArticlesList: async function(offset, limit, param) {
      offset = offset || 0;
      limit = limit || 10;
      param = param || {};
      let options = {
        type: 'getArticlesList',
        query: {
          offset: offset,
          limit: limit,
          author: param.author,
          favorited: param.favourited,
          tag: param.tag
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    getArticlesFeed: async function(offset, limit) {
      offset = offset || 0;
      limit = limit || 10;
      let options = {
        type: 'getArticlesFeed',
        query: {
          offset: offset,
          limit: limit
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    getTags: async function() {
      let options = {
        type: 'getTags'
      };
      let results = await QEWD.reply(options);
      return results.message.tags;
    },
    getProfile: async function() {
      let options = {
        type: 'getProfile',
        params: {
          username: context.author
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message.profile;
    },
    getArticleBySlug: async function() {
      let options = {
        type: 'getArticleBySlug',
        params: {
          slug: context.slug
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message.article;
    },
    getComments: async function() {
      let options = {
        type: 'getComments',
        params: {
          slug: context.slug
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message.comments;
    },
    registerUser: async function(username, email, password) {
      let errors;
      if (!email || email === '') {
        if (!errors) errors = {};
        errors.email = ["can't be empty"]
      }
      if (!username || username === '') {
        if (!errors) errors = {};
        errors.username = ["can't be empty"];
      }
      if (!password || password === '') {
        if (!errors) errors = {};
        errors.password = ["can't be empty"];
      }
      if (errors) {
        return {errors: errors};
      }
      let options = {
        type: 'registerUser',
        body: {
          user: {
            username: username,
            email: email,
            password: password 
          }
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    authenticateUser: async function(email, password) {
      let errors;
      email = email || '';
      password = password || '';
      if (email === '' || password === '') {
        errors = {
          'email or password': ['is invalid']
        };
        return {errors: errors};
      }
      let options = {
        type: 'authenticateUser',
        body: {
          user: {
            email: email,
            password: password 
          }
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    getUser: async function() {
      let options = {
        type: 'getUser',
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    follow: async function(author) {
      let options = {
        type: 'follow',
        params: {
          username: author
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    unfollow: async function(author) {
      let options = {
        type: 'unfollow',
        params: {
          username: author
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    favourite: async function(slug) {
      let options = {
        type: 'favourite',
        params: {
          slug: slug
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    unfavourite: async function(slug) {
      let options = {
        type: 'unfavourite',
        params: {
          slug: slug
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    addComment: async function(slug, text) {
      let errors;
      if (!text || text === '') {
        errors = {
          'comment': ['is empty']
        };
        return {errors: errors};
      }
      if (!context.jwt) {
        errors = {
          'user': ['is not authenticated']
        };
        return {errors: errors};
      }

      let options = {
        type: 'addComment',
        params: {
          slug: slug
        },
        body: {
          comment: {
            body: text 
          }
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    deleteComment: async function(id) {
      let errors;
      if (!context.jwt) {
        errors = {
          'user': ['is not authenticated']
        };
        return {errors: errors};
      }
      let options = {
        type: 'deleteComment',
        params: {
          slug: context.slug,
          id: id
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    createArticle: async function(title, description, body, tagList) {
      let errors;
      if (!title || title === '') {
        if (!errors) errors = {};
        errors.title = ["can't be empty"]
      }
      if (!description || description === '') {
        if (!errors) errors = {};
        errors.description = ["can't be empty"];
      }
      if (!body || body === '') {
        if (!errors) errors = {};
        errors.body = ["can't be empty"];
      }
      if (!context.jwt) {
        if (!errors) errors = {};
        error.user = ['is not authenticated'];
      }
      if (errors) {
        return {errors: errors};
      }
      let options = {
        type: 'createArticle',
        body: {
          article: {
            title: title,
            description: description,
            body: body,
            tagList: tagList || []
          }
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    deleteArticle: async function(slug) {
      let errors;
      if (!context.jwt) {
        errors = {
          'user': ['is not authenticated']
        };
        return {errors: errors};
      }
      let options = {
        type: 'deleteArticle',
        params: {
          slug: slug
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    updateArticle: async function(slug, title, description, body, tagList) {
      let errors;
      if (!title || title === '') {
        if (!errors) errors = {};
        errors.title = ["can't be empty"]
      }
      if (!description || description === '') {
        if (!errors) errors = {};
        errors.description = ["can't be empty"];
      }
      if (!body || body === '') {
        if (!errors) errors = {};
        errors.body = ["can't be empty"];
      }
      if (!context.jwt) {
        if (!errors) errors = {};
        error.user = ['is not authenticated'];
      }
      if (errors) {
        return {errors: errors};
      }
      let options = {
        type: 'updateArticle',
        params: {
          slug: slug
        },
        body: {
          article: {
            title: title,
            description: description,
            body: body,
            tagList: tagList || []
          }
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    },
    updateUser: async function(params) {
      let email = params.email;
      let username = params.username;
      let errors;
      if (!email || email === '') {
        if (!errors) errors = {};
        errors.email = ["can't be empty"]
      }
      if (!username || username === '') {
        if (!errors) errors = {};
        errors.username = ["can't be empty"];
      }
      if (!context.jwt) {
        if (!errors) errors = {};
        error.user = ['is not authenticated'];
      }
      if (errors) {
        return {errors: errors};
      }
      let options = {
        type: 'updateUser',
        body: {
          user: params
        },
        JWT: context.jwt
      };
      let results = await QEWD.reply(options);
      return results.message;
    }
  };

  return {apis};
};