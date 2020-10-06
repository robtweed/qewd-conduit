# How *qewd-conduit* Models the Data

## QEWD-JSdb

*qewd-conduit* stores and maintains its data using QEWD's built-in 
[*QEWD-JSdb*](https://github.com/robtweed/qewd-jsdb) technology.
*QEWD-JSdb* is a JSON abstraction of so-called *Global Storage* databases 
(eg [IRIS](https://www.intersystems.com/products/intersystems-iris/), 
[Cach&eacute;](https://www.intersystems.com/products/cache/) and 
[YottaDB](https://yottadb.com/)).

*QEWD-JSdb* maps JSON data structures to and from the hierarchical storage
of the supported Global Storage databases.  If you understand JSON, you
understand QEWD-JSdb.

In summary, QEWD-JSdb allows you to:

- convert an in-memory JavaScript Object to a corresponing persistent JSON Object, stored in the database.

- convert some or all of a persistent JSON Object stored in the database into a corresponding in-memory JavaScript Object.

- manipulate a persistent JSON Object directly within the database.  You can access at every level down to and
including individual name/value pairs anywhere within a persistent JSON Object's hierarchical structure.


## Persistent JSON used in *qewd-conduit*

*qewd-conduit* uses three persistent JSON objects to represent the Conduit data:

- users
- articles
- comments

### Users

The Persistent Document Name (aka Global) used for storage of users
is *conduitUsers*.

Each registered user is allocated a unique Id.  The Id is a simple integer,
maintained and allocated by incrementing the JSON structure:

        {
          "nextId": {{last_allocated_id}}
        }

eg:

        {
          "nextId": 21
        }

The main data record for an individual user is represented in JSON terms as:

        {
          "byId": {
            {{id}}: {
              "bio": {{biography_text}},
              "createdAt": {{date_user_record_first_created}},
              "email": {{email_address}},
              "favorited": {
                {{article_id}}: {{articleId}}
              },
              "follows": {
                {{user_id}}: {{user_id}}
              },
              "id": {{id}},
              "image": {{imageUrl}},
              "password": {{hashed_password}},
              "updatedAt": {{date_user_record_last_modified}},
              "username": {{username}}
            }
          }
        }

For example:

        {
          "byId": {
            10: {
              "bio": "I am the author of QEWD",
              "createdAt": "2017-05-02T20:28:04.762Z",
              "email": "rtweed@mgateway.com",
              "favorited": {
                2: 2,
                5: 5
              },
              "follows": {
                8: 8
              },
              "id": 10,
              "image": "https://s3.amazonaws.com/mgateway/qewd/qewd_logo5.png",
              "password": ="$2a$10$QF3cyiU8iudNBc02ysWEJuV/uqnkXcf5SYkM41fzuN3WxLeUutN32",
              "updatedAt": "2017-05-19T20:27:49.682Z",
              "username": "rtweed"
            }
          }
        }

This user, whose Id is 10, has favourited two articles (with article Ids of 2 and 5),
and follows the user whose user Id is 8.

Each data record is also indexed:

- by email address:

        {
          "byEmail": {
            {{email_address}}: {{id}}
          }
        }

  eg, for the data record above:

        {
          "byEmail": {
            "rtweed@mgateway.com": 10
          }
        }   


- by username

        {
          "byUsername": {
            {{username}}: {{id}}
          }
        }

  eg, for the data record above:

           {
          "byUsername": {
            "rtweed": 10
          }
        }

*qewd-conduit*'s logic ensures that usernames and email addresses are unique within
the user database

Putting it all together, after adding a first user into the database, it would look
something like this:

        conduitUsers:

        {
          "byId": {
            1: {
              "bio": "I am the author of QEWD",
              "createdAt": "2017-05-02T20:28:04.762Z",
              "email": "rtweed@mgateway.com",
              "id": 1,
              "image": ""https://s3.amazonaws.com/mgateway/qewd/qewd_logo5.png",
              "password": ="$2a$10$QF3cyiU8iudNBc02ysWEJuV/uqnkXcf5SYkM41fzuN3WxLeUutN32",
              "updatedAt": "2017-05-02T20:28:04.762Z",
              "username": "rtweed"
            }
          },
          "byEmail": {
            "rtweed@mgateway.com": 1
          },
          "byUsername": {
            "rtweed": 1
          },
          "nextId": 1
        }


### Articles

The Persistent Document Name (aka Global) used for storage of articles
is *conduitArticles*.

Each registered article is allocated a unique Id.  The Id is a simple integer,
maintained and allocated by incrementing the JSON structure:

        {
          "nextId": {{last_allocated_id}}
        }

eg:

        {
          "nextId": 21
        }

The main data record for an individual article is represented in JSON terms as:

        {
          "byId": {
            {{id}}: {
              "author": {{user_id_of_author}},
              "body": {{text_of_main_body_of_article}},
              "comments": {
                {{comment_id}}: {{comment_id}}
              },
              "createdAt": {{date_article_first_created}},
              "description": {{description_of_article}},
              "favoritesCount": {{number_of_times_article_has_been_favourited}},
              "slug": {{article_slug}},
              "tagList": [
                {{tag}}
              ]
              "timestampIndex": {{reverse_chronological_date}},
              "title": {{article_title}},
              "updatedAt": {{date_article_last_modified}}
            }
          }
        }

For example:

        {
          "byId": {
            1: {
              "author": 10,
              "body": "QEWD is an amazing framework that everyone should use...etc",
              "comments": {
                2: 2,
                5: 5
              },
              "createdAt": "2017-05-03T06:59:16.339Z",
              "description": "All you ever wanted to know about QEWD",
              "favoritesCount": 5,
              "slug": "about-qewd",
              "tagList": [
                "node.js",
                "javascript"
              ]
              "timestampIndex": 98506191930848,
              "title": "About QEWD",
              "updatedAt": "2017-05-03T08:23:10.203Z"
            }
          }
        }

Each article data record is also indexed:

- by author:

        {
          "byAuthor": {
            {{user_id_of_author}}: {
              {{article_id}}: {{article_id}}
            }
          }
        }

  eg, for the data record above:

        {
          "byAuthor": {
            10: {
              1: 1
            }
          }
        }   

  This structure allows for the fact that an author can create multiple articles


- by slug

        {
          "bySlug": {
            {{slug}}: {{id}}
          }
        }

  eg, for the data record above:

        {
          "bySlug": {
            "about-qewd": 1
          }
        }

  *qewd-conduit* ensures that slugs (derived from the article's title)
 are unique across the *articles* database.

- by tag:

        {
          "byTag": {
            {{tag}}: {
              {{article_id}}: {{article_id}}
            }
          }
        }

  eg, for the data record above:

        {
          "byTag": {
            "node.js": {
              1: 1
            },
            "javascript": {
              1: 1
            }
          }
        }   

  This structure allows for the fact that the same tag can be used in multiple
articles.


Putting it all together, after adding a first article into the database, it would look
something like this:

        conduitArticles:


        {
          "byId": {
            1: {
              "author": 10,
              "body": "QEWD is an amazing framework that everyone should use...etc",
              "createdAt": "2017-05-03T06:59:16.339Z",
              "description": "All you ever wanted to know about QEWD",
              "slug": "about-qewd",
              "tagList": [
                "node.js",
                "javascript"
              ]
              "timestampIndex": 98506191930848,
              "title": "About QEWD",
              "updatedAt": "2017-05-03T08:23:10.203Z"
            }
          },
          "byAuthor": {
            10: {
              1: 1
            }
          },
          "bySlug": {
            "about-qewd": 1
          },
          "byTag": {
            "node.js": {
              1: 1
            },
            "javascript": {
              1: 1
            }
          },
          "nextId": 1
        }


### Comments

The Persistent Document Name (aka Global) used for storage of comments
is *conduitComments*.

Each registered comment is allocated a unique Id.  The Id is a simple integer,
maintained and allocated by incrementing the JSON structure:

        {
          "nextId": {{last_allocated_id}}
        }

eg:

        {
          "nextId": 21
        }

The main data record for an individual comment is represented in JSON terms as:

        {
          "byId": {
            {{id}}: {
              "articleId": {{id_of_article_to_which_comment_applies}},
              "author": {{user_id_of_comment_author}},
              "body": {{main_text_body_of_comment}},
              "createdAt": {{date_comment_created}},
              "id": {{id}},
              "updatedAt": {{date_comment_last_modified}}
            }
          }
        }

For example:

        {
          "byId": {
            28: {
              "articleId": 5,
              "author": 10,
              "body": "This is recommended reading",
              "createdAt": "2017-05-03T06:59:16.339Z",
              "id": 28,
              "updatedAt": "2017-05-03T06:59:16.339Z"
            }
          }
        }

Comments are not indexed


Putting it all together, after adding a first comment into the database, it would look
something like this:

        conduitComments:

        {
          "byId": {
            1: {
              "articleId": 5,
              "author": 10,
              "body": "This is recommended reading",
              "createdAt": "2017-05-03T06:59:16.339Z",
              "id": 1,
              "updatedAt": "2017-05-03T06:59:16.339Z"
            }
          },
          "nextId": 1
        }


## The *qewd-conduit* Logic for Maintaining the Database

You'll find the logic used by *qewd-conduit* for maintaining the
peristent JSON Objects described in the repository's */conduit/db* directory:

- users (*/conduit/db/users.js*)
- articles (*/conduit/db/articles.js*)
- comments (*/conduit/db/comments.js*)

Each module contains a set of APIs for maintaining the persistent JSON Object.

For example, to create a new comment, the *create* API within */conduit/db/comments.js*
is invoked.  Here's the code taken from that API, embellished with my comments to describe
what is happening:

        function create(authorId, articleId, commentBody) {

          // get a new Id for this new comment:

          let commentId = getNextId.call(this);

          // Convert the dates to ISO format

          let iso = new Date().toISOString();

          // Assemble the data record as a JavaScript Object:

          let comment = {
            id: commentId,
            articleId: articleId,
            body: commentBody,
            author: authorId,
            createdAt: iso,
            updatedAt: iso
          };

          // Instantiate a QEWD-JSdb Document Node Object that represents the
          // physical Global Storage Node for this comment.
          // We want to use the Persistent Document (aka Global) named
          // conduitComments, and use the JSON hierarchy level:


          //    {
          //      "byId": {
          //         {{commentId}}: {}
          //      }
          //    }


          // And then apply the setDocument() method for that Document Node Object
          // This maps the JavaScript object (comment) into the specified physical Global
          // Storage node

          this.db.use('conduitComments', 'byId', commentId).setDocument(comment);

          // link the comment record to the associated article record

          linkComment.call(this, articleId, commentId);

          // all done: return the id of the new comment

          return commentId;
        }

Let's take a look at that *getNextId()* API:

        function getNextId() {
          return this.db.use('conduitComments', 'nextId').increment();
        }

I'll expand and comment that for clarity:

        function getNextId() {

          // Instantiate a QEWD-JSdb Document Node Object that represents the
          // physical Global Storage Node used for maintaining the next comment id.
          // We want to use the Persistent Document (aka Global) named
          // conduitComments, and use the JSON hierarchy level within it:


          //    {
          //      "nextId": {{id}}
          //    }

          let nodeObj = this.db.use('conduitComments', 'nextId');

          // invoke its increment() method.  This increments the integer value at
          // the specified node and returns it:

          let commentId = nodeObj.increment();

          // return this new comment Id

          return commentId;

        }


And let's also take a look at that *linkComment()* API:

        function linkComment(articleId, commentId) {
          this.db.use('conduitArticles', 'byId', articleId, 'comments', commentId).value = commentId;
        }

I'll expand and comment that for clarity:

        function linkComment(articleId, commentId) {

          // Instantiate a QEWD-JSdb Document Node Object that represents the
          // physical Global Storage Node used for linking comments to articles.
          // We want to use the Persistent Document (aka Global) named
          // conduitArticles, and use the JSON hierarchy level within it:


          //    {
          //      "byId": {
          //        {{articleId}}: {
          //          "comments": {
          //            {{commentId}}: 
          //          }
          //        }
          //      }
          //    }

          let nodeObj = this.db.use('conduitArticles', 'byId', articleId, 'comments', commentId);

          // set the comment Id as the node's value property.  This demonstrates how
          // you can manipulate an individual name/value pair in-situ within a specified
          // node within a persistent JSON Object's hierarchy:

          nodeObj.value = commentId;

          // We now have a pointer connection established that links the specified
          // comment record to its associated article record

        }


## Inspecting the *qewd-conduit* Database

You can inspect the *qewd-conduit* database in numerous ways:

- Using the *qewd-monitor* or *qewd-monitor-adminui* applications
that are included with your QEWD system

- Using utilities built into the Global Storage database that you are
using with your QEWD system.  These will show you the raw, hierarchical
structure to which the persistent JSON is mapped.  For example, the
*conduitComments* record above would be mapped to the following raw
Global structure:

        ^conduitComments("byId",1,"articleId")=5
        ^conduitComments("byId",1,"author")=10
        ^conduitComments("byId",1,"body")="This is recommended reading"
        ^conduitComments("byId",1,"createdAt")="2017-05-03T06:59:16.339Z"
        ^conduitComments("byId",1,"id")=1
        ^conduitComments("byId",1,"updatedAt")="2017-05-03T06:59:16.339Z"
        ^conduitComments("nextId")=1


