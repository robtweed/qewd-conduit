# ![QEWD Example App](https://cloud.githubusercontent.com/assets/556934/25587724/182f95fc-2e5a-11e7-83db-1541c1bee128.png)

> ### Example QEWD Back-end codebase that adheres to the [RealWorld](https://github.com/gothinkster/realworld-example-apps) spec and API.

This repo is functionality complete - PR's and issues welcome!

----------
 
Rob Tweed <rtweed@mgateway.com>  
25 January 2017, M/Gateway Developments Ltd [http://www.mgateway.com](http://www.mgateway.com)

Updated: 4 October 2020

Twitter: @rtweed

Google Group for discussions, support, advice etc: [http://groups.google.co.uk/group/enterprise-web-developer-community](http://groups.google.co.uk/group/enterprise-web-developer-community)

----------
	   
## About qewd-conduit

  *qewd-conduit* is a full implementation of the REST back-end for the 
  [RealWorld Conduit](https://medium.com/@ericsimons/introducing-realworld-6016654d36b5)
  application using [QEWD](http://qewdjs.com).

  *qewd-conduit* requires [QEWD](https://github.com/robtweed/qewd) to be installed on your server.
  QEWD itself is a Node.js-based Web Application & REST run-time platform.

  The QEWD installation and configuration process is very quick and almost completely automated.
  You'll find that you can install *qewd-conduit* and have it fully up and running in
  literally just a few minutes, so there are really no reasons not to try it out!

  *qewd-conduit* can work with a number of so-called Global Storage databases, including:

- [InterSystems IRIS](https://www.intersystems.com/products/intersystems-iris/)
- [InterSystems Cach&eacute;](https://www.intersystems.com/products/cache/)

QEWD applies an abstraction known as [QEWD-JSdb](https://github.com/robtweed/qewd-jsdb) to these databases, 
which makes them behave as a Document Database and Persistent JavaScript Objects

[Read my article](https://robtweed.wordpress.com/2017/04/18/having-your-node-js-cake-and-eating-it-too/) 
that explains the rationale and objectives of QEWD.
  
Since the back-end specification of the RealWorld Conduit application is 
[fully documented](https://github.com/gothinkster/realworld/tree/master/api) 
and implemented using 
[several other technologies and/or frameworks](https://github.com/gothinkster/realworld), 
it provides a great way of comparing and contrasting the different development approaches
used for each option.

Although QEWD is a Node.js-based platform, you'll see that the way in which the back-end has
been able to be developed is quite different from what you'd expect.  Whilst it's all
been written in JavaScript, there's no asynchronous logic, even for the database
manipulation.  That's possible due to QEWD's master process / queue / worker process-pool
architecture.

The RealWorld Conduit initiative also allows direct comparisons to be made in terms of
back-end performance.  I think you'll be favourably impressed by the performance of 
*qewd-conduit* which is largely down to the lightning-fast performance of the underlying
database (IRIS or Cach&eacute;) and the 
[in-process Node.js database interface](https://github.com/chrisemunt/mg-dbx) used by QEWD.

What may be less easy to appreciate is the speed of development when using the different
RealWorld Conduit back-end technologies.  I can tell you that, in the case of *qewd-conduit*, 
the entire back-end was implemented from scratch in just 2 man-days, including the time taken
to read up on and understand the application's objectives, requirements and APIs.  Part of
the speed of development comes from not having to worry about asynchronous logic, but it's
also due to the very high-level database abstraction of
[QEWD-JSdb](https://github.com/robtweed/qewd-jsdb).

## WebSocket Support

Uniquely amongst RealWorld Conduit back-end implementations, *qewd-conduit* not only
implements the full suite of Conduit REST APIs, but also provides equivalent APIs that
are accessed via WebSockets.

These make use of QEWD's built-in WebSocket support, and require specially-adapted
versions of the RealWorld front-ends that use the 
[QEWD-Client](https://github.com/robtweed/qewd-client) to communicate securely
via WebSockets with the *qewd-conduit* back-end.  

Ward De Backer has created a 
[suitably-adapted version of the Vue.js RealWorld front-end application](https://github.com/wdbacker/vue-realworld-example-app)
 that you can use to try out the *qewd-conduit* WebSocket interfaces.  For instructions, see
later in this document.

## Installing and Running the *qewd-conduit* Back-end

See the instructions for the following platforms:

- [IRIS running on Windows](https://github.com/robtweed/qewd-conduit/blob/master/IRIS-windows.md)


## Installing and Running the *RealWorld* Front-End

*qewd-conduit* implements the *RealWorld* REST API specification, so you can install and
use any of the authorized client interfaces, the details and instructions for which
[can be seen here](https://github.com/gothinkster/realworld#frontends).  

Just ensure you
configure your chosen front-end to send its REST requests to the endpoints provided by
your installed QEWD Conduit back-end.

As an example, Ward De Backer has provided:
- [detailed documentation](https://github.com/wdbacker/qewd-howtos/blob/master/VueRealWorldConduit.md) 
  on how to install and use the [Vue RealWorld Example application client](https://github.com/gothinkster/vue-realworld-example-app) 
  with a *qewd-conduit* Back-end
- [detailed documentation](https://github.com/wdbacker/qewd-howtos/blob/master/ReactRealWorldConduit.md) 
  on how to install and use the [React Redux RealWorld Example application client](https://github.com/gothinkster/react-redux-realworld-example-app) 
  with a *qewd-conduit* Back-end
- [detailed documentation](https://github.com/wdbacker/qewd-howtos/blob/master/AngularRealWorldConduit.md) 
  on how to install and use the [Angular RealWorld Example application client](https://github.com/gothinkster/angular-realworld-example-app) 
  with a *qewd-conduit* Back-end

His [documentation](https://github.com/wdbacker/qewd-howtos/blob/master/VueRealWorldConduitWS.md) 
also explains how to use his 
[specially-adapted WebSocket-enabled version](https://github.com/wdbacker/vue-realworld-example-app)
of this same Vue.js client.  You'll then be able to compare and contrast the relative performance of
the REST and WebSocket interfaces for the same set of APIs (which, within *qewd-conduit*, 
as you might expect, invoke the exact same underlying API handler logic modules).


## How the *qewd-conduit* Back-end Works

*qewd-conduit* has been developed following the standard, so-called
[QEWD-Up approach (click for details)](https://github.com/robtweed/qewd/tree/master/up).

In summary:

- the system configuration is described in the */configuration/config.json* file;

- the REST API routes are described in the */configuration/routes.json* file.  Each
  route is described as an object that defines its:
  - URI;
  - HTTP method; and 
  - handler name
    - the correspondingly-named handler modules can be found in the */apis* directory
    - the handler logic is in each handler module's *index.js* file.  

      Every handler module
      has the same signature, with all the incoming REST request's information being
      represented appropriately in the *args* argument.

      On completion, each handler module returns its JSON response object as the sole argument
      of a special QEWD-supplied function called *finished()*.  This *finished()* function returns the
      JSON response to the REST client and also releases the QEWD Worker process back to
      the available Worker pool.

- the WebSocket interfaces can be found in the */qewd-apps/qewd-conduit* directory.  There is
  a named handler module for each supported WebSocket message, and these correspond by name to
  the *qewd-conduit* REST handler names.  if you look at the *index.js* file for each WebSocket
  handler module, you'll see that they are all simply wrapper stubs, calling another module
  that converts the WebSocket message contents into the corresponding REST handler module's
  *args* object, and then invokes the corresponding REST handler method.  In other words, the
  WebSocket interface is simply (but very effectively!) a wrapper around the REST handler methods.

- the physical database handling for the persistent objects used in *qewd-conduit* is encapsulated as
  as set of APIs which are used by the various REST API handler methods.  This is done in order to
  keep all the physical database handling logic for each persistent object into just one place, rather
  than it being spread around within the REST API handler methods.

  The database objects are described in the */conduit/db* directory

  In there, you'll see that there are just three persistent objects in *qewd-conduit*,
  with corresponding handler API modules:

  - users (*/conduit/db/users.js*)
  - articles (*/conduit/db/articles.js*)
  - comments (*/conduit/db/comments.js*)

  Each of these modules defines the CRUD methods used to maintain and access the persistent
  object using the [QEWD-JSdb](https://github.com/robtweed/qewd-jsdb) abstraction methods.

  The QEWD-JSdb modelling of these persistent Objects, and how they map to
physical Global Storage is 
[described in this article](https://github.com/robtweed/qewd-conduit/blob/master/QEWD-JSdb.md).


## Inspecting the *qewd-conduit* Database

*qewd-conduit* stores and maintains the Conduit data in three Globals:

- conduitUsers
- conduitArticles
- conduitComments

You can use any of the utilities provided by IRIS or Cach&eacute; to inspect these Globals.

You can also use the *qewd-monitor* or *qewd-monitor-adminui* applications to inspect them.
In particular, check out the *qewd-monitor-adminui* *QEWD JSdb Inspector* option which
provides a graphical representation of the hierarchy tree of each Global through which
you can navigate.


## License

 Copyright (c) 2017-20 M/Gateway Developments Ltd,                           
 Redhill, Surrey UK.                                                      
 All rights reserved.                                                     
                                                                           
  http://www.mgateway.com                                                  
  Email: rtweed@mgateway.com                                               
                                                                           
                                                                           
  Licensed under the Apache License, Version 2.0 (the "License");          
  you may not use this file except in compliance with the License.         
  You may obtain a copy of the License at                                  
                                                                           
      http://www.apache.org/licenses/LICENSE-2.0                           
                                                                           
  Unless required by applicable law or agreed to in writing, software      
  distributed under the License is distributed on an "AS IS" BASIS,        
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
  See the License for the specific language governing permissions and      
   limitations under the License.      
