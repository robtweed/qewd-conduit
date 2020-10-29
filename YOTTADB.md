# Installing and Running *qewd-conduit* with YottaDB

## Contents

- [Introduction](#introduction)
- [Installing *qewd-conduit*](#installing-qewd-conduit)
- [Running *qewd-conduit*](#running-qewd-conduit)

----

# Introduction

The instructions below explain how to installl and run the *qewd-conduit* Back-end,
 running on either Linux systems or on a Raspberry Pi, connecting to the Open-Source
YottaDB database.

----

# Installing *qewd-conduit*

## Install *git*

You'll need to ensure that you can clone the *qewd-conduit* Github Repository, so make sure
you have installed *git*.  If not:

        sudo apt-get update
        sudo apt-get install git

(or the equivalent for your Linux distribution)


## Clone the *qewd-conduit* Github Repository

It's up to you to decide where to install *qewd-conduit* within your Linux or
Raspberry Pi directory structure.  In this document I'm going to assume you'll 
install it in a folder directly under your *home (~)* directory.  Adjust any 
paths described in this document appropriately if you
decide to install in some other directory path.

In a Terminal/Shell session, type the following:

        cd ~
        git clone https://github.com/robtweed/qewd-conduit


On completion, you should now have a structure that includes:

        ~/qewd-conduit
            |
            |_ install-scripts
            |
            |_ apis
            |
            |_ conduit
            |
            |_ configuration
            |
            |_ www
            |
            |_ package.json


You'll also see some other folders and files.  Many of these are used for other *qewd-conduit*
configurations and platforms, so they can be ignored, but others will also be explained
later in this documentation.

## Install Node.js

You need to ensure that Node.js is installed on your Linux system or Raspberry
Pi. *qewd-conduit* requires either Node.js versions 12.x and 14.x.

Do not install earlier versions of Node.js, and if you already have an earlier version of Node.js
installed, you will need to update it.

If you don't already have Node.js installed, the easiest way to install it is to
use the installer script that is included in the *qewd-conduit* folder.

In a Terminal/Shell session, type the following:

        cd ~
        source qewd-conduit/install-scripts/install_node.sh

You'll be asked your Linux password, and then installation will commence.

On completion, you should have the latest version of Node.js installed
on your Linux system or Raspberry Pi.


## Install YottaDB

If you don't have YottaDB installed, you can use the
installation script included in this repository.  It will install the latest 
Release 1.30:

        cd ~
        source qewd-conduit/install-scripts/install_ydb.sh

You can test if the installation ran to completion by opening the
YottaDB shell.  Simply type the command:

        ydb

You should see the YottaDB shell prompt:

        YDB>

Try:

        YDB> w $zyrelease

You should see:

        YottaDB r1.30 Linux x86_64

Next, try setting a Global node, eg:

        YDB> set ^test("foo")="bar"

If it returns the *YDB>* prompt then it should be working OK.  Try listing the Global just
to be sure:

        YDB> zwr ^test

and you should see:

        ^test("foo")="bar"

        YDB>

Exit the shell:

        YDB> halt

and you should return to the Linux shell prompt.


## Install a C++ Compiler

Note: you can ignore this step if you've run the YottaDB installation script above.

Run the following commands:

        sudo apt-get update
        sudo apt-get install build-essential


These commands are safe to type even if you're unsure whether or not you've already
installed a C++ compiler on your Linux machine.



## Install the correct QEWD Configuration JSON file

If you look in the *configuration* sub-folder, you'll find a number of files, in particular:


        ~/qewd-conduit
            |
            |_ configuration
                 |
                 |- config.json
                 |
                 |- config.json.yottadb


Delete the *config.json* file and rename *config.json.yottadb* to *config.json*

The settings in this file can be left as they are until you
become more familiar with using QEWD.  The customisable settings
(*port*, *poolSize*, *serverName* and *managementPassword*) are
[described here](./CONFIG.md).


## Install the correct QEWD *package.json* file

If you look in the *qewd-conduit* installation folder, you'll find two versions of
the *package.json* file:


        ~/qewd-conduit
              |
              |- package.json
              |
              |- package.json.non-windows


Delete the *package.json* file and rename *package.json.non-windows* to *package.json*


## Install QEWD

Everything is now ready for use, but first we must install QEWD and its
dependencies. This step only needs doing once.


In a Twerminal/ Shell process, type the following:


        cd ~/qewd-conduit

        npm install


You'll see it installing QEWD, and in the QEWD Installation folder (*~/qewd-conduit*), 
you'll see a sub-folder named *node_modules* and a file named *package-lock.json* appear, 
eg your top-level folder structure should now include:


       ~/qewd-conduit
            |
            |_ apis
            |
            |_ conduit
            |
            |_ www
            |
            |_ package.json
            |
            |_ package-lock.json
            |
            |_ configuration
            |
            |- node_modules



When it completes, you're ready to start QEWD


## Starting QEWD for the First Time

Start QEWD for the first time as follows:

        cd ~/qewd-conduit

        npm start

The first time you start QEWD, it installs a bunch of extra things, so you'll see
new sub-folders such as *qewd-apps* appear. QEWD has loaded in everything you need
for monitoring your system and for developing interactive applications if you wish to do so.

After this initial installation has completed, QEWD will stop and ask you
to restart.

*qewd-conduit* is now ready for use.


# Running *qewd-conduit*


## Starting QEWD

Each time you want to start QEWD, first make sure you're in your QEWD Installation folder, eg

        cd ~/qewd-conduit

and then start QEWD by typing:

        npm start


QEWD is ready for use when you see this (the poolsize and port will depend on your *config.json* settings):


        route /api will be handled by qx.router
        Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 2
        ========================================================
        ========================================================
        QEWD.js is listening on port 3000
        ========================================================



## Accessing the *qewd-conduit* REST APIs

The REST APIs can be accessed via HTTP requests to the following endpoint:

        http://x.x.x.x:3000/api/{name}

where:

- x.x.x.x is the IP address or domain name of the server on which you're running QEWD
- {name} is the name of a specific REST API

For example:

        http://192.168.1.100:3000/api/tags



## Quick Ping Test

*qewd-conduit* includes an additional REST API which you can send from a browser
to quickly check that it is properly up and running:


        http://x.x.x.x:3000/api/ping

For example:

        http://192.168.1.100:3000/api/ping


If QEWD is correctly running, you'll get the JSON response

        {pong: true}


## Optional: Try the QEWD-Monitor Application


You can check that your *qewd-conduit* instance is working correctly by running the
*qewd-monitor* application that will now have been installed:

Start the QEWD-Monitor application in your browser using the URL:

        http://x.x.x.x:3000/qewd-monitor

or try the latest version:

        http://x.x.x.x:3000/qewd-monitor-adminui


You'll need to enter the QEWD Management password.  Use the value that you
specified in the *managementPassword* property in the *qewd-conduit* *config.json* file.

You'll now see the Overview panel, from where you can monitor your QEWD run-time environment, view the master and worker process activity.

If the *qewd-monitor* application works correctly, then you can be sure that *qewd-conduit*
is working correctly and is ready for use.


## Running the *wc-conduit* RealWorld Client

Your *qewd-conduit* installation includes a pre-installed,
copy of the [*wc-conduit*](https://github.com/robtweed/wc-conduit)
RealWorld front-end client.  To run it, simply enter the following
URL into your browser:

        http://x.x.x.x:3000/conduit-wc

For example:

        http://192.168.1.100:3000/conduit-wc

It is pre-configured to use your *qewd-conduit* system's REST APIs.

If you want to compare your *qewd-conduit* back-end's operation with
another Conduit back-end, simply edit the *wc-conduit* *userSettings*
file that you'll find at:

        ~/qewd-conduit\www\conduit-wc\js\userSettings.js

The file contains self-explanatory comments that describe what you need to do to 
modify its configuration.

If you want to try out *qewd-conduit*'s alternative WebSocket APIs, simply
load this URL instead:

        http://x.x.x.x:3000/conduit-wc/index-ws.html

For example:

        http://192.168.1.100:3000/conduit-wc/index-ws.html

You can read further information about the 
[WebSocket version of the *wc-conduit* front-end here](https://github.com/robtweed/wc-conduit#running-wc-conduit-using-websocket-apis).


Alternatively, you can, of course, use any other of the available RealWorld front-ends: they
should all work identically with your *qewd-conduit* system, provided you
re-configure them to send their REST requests to your *qewd-conduit* back-end.


## Stopping QEWD

To shut down the *qewd-conduit* Back-end you must stop QEWD.

If you're running QEWD in a foreground window process, simply type CTRL & C


Alternatively, you can stop QEWD by using the *qewd-monitor* or *qewd-monitor-adminui* applications.
For example:  

- In a browser, start it up:

        http://192.168.1.100:3000/qewd-monitor-adminui

        Note: change the IP address & port to match your server and QEWD configuration

- Login using the management password that you specified in the *config.json* file.

- Click the red X button in the Master Process Title bar




