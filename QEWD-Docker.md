# Installing and Running *qewd-conduit* using the QEWD Docker Container

## Contents

- [Introduction](#introduction)
- [Installing *qewd-conduit*](#installing-qewd-conduit)
- [Running *qewd-conduit*](#running-qewd-conduit)

----

# Introduction

The instructions below explain how to installl and run the *qewd-conduit* Back-end
using the pre-built QEWD Docker Container.  The Dockerised version of QEWD includes
a pre-installed, pre-configured instance of the YottaDB database, which will be
used to store the *qewd-conduit* persistent resources.

There are Dockerised versions of QEWD for standard Linux environments (they should
also run on OSX), and for the Raspberry Pi.  If you use the following
instructions, the correct version will be automatically installed and configured
for you.

Don't worry if you don't already have Docker installed.

----

# Installing *qewd-conduit*

## Install *git*

You'll need to ensure that you can clone the *qewd-conduit* Github Repository, so make sure
you have installed *git*.  If not:

        sudo apt-get update
        sudo apt-get install git

(or the equivalent for your Linux distribution or operating system)


## Clone the *qewd-conduit* Github Repository

It's up to you to decide where to install *qewd-conduit* within your system's
 directory structure.  In this document I'm going to assume you'll 
install it in a folder directly under your *home (~)* directory.  Adjust any 
paths described in this document appropriately if you
decide to install in some other directory path.

In a Terminal/Shell session, type the following:

        cd ~
        git clone https://github.com/robtweed/qewd-conduit


On completion, you should now have a structure that includes:

        ~/qewd-conduit
            |
            |_ apis
            |
            |_ conduit
            |
            |_ configuration
            |
            |_ www
            |
            |_ install.sh
            |
            |_ install.js


You'll also see some other folders and files.  Many of these are used for other *qewd-conduit*
configurations and platforms, so they can be ignored.


## Run the Installer/Configurator

Just type these commands in a Linux system or Raspberry Pi:

        cd ~/qewd-conduit
        source install.sh

Don't worry if you don't have Docker installed (which is the only dependency) - the installer
will also install Docker if necessary (though you'll need to start a new process and re-run
the installer using the same commands above after it installs Docker).

Then simply answer the questions and within a few minutes you'll have it all ready to run.


## Starting *qewd-conduit*

When the installer has completed you have two options for starting 
*qewd-conduit* with the QEWD Docker container:

- without database persistence between Container restarts:

        cd ~/qewd-conduit
        ./start

- with database persistence between Container restarts:


        cd ~/qewd-conduit
        ./start_p


You can monitor the activity of the QEWD Container by running:

        docker logs -f conduit


# Running *qewd-conduit*

QEWD is ready for use when, having started the Container, you see this 
in the Docker log (the poolsize and port will depend on your *config.json* settings):


        route /api will be handled by qx.router
        Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 2
        ========================================================
        ========================================================
        QEWD.js is listening on port 8080
        ========================================================

You can now begin using *qewd-conduit*.


## Accessing the *qewd-conduit* REST APIs

The REST APIs can be accessed via HTTP requests to the following endpoint:

        http://x.x.x.x:8080/api/{name}

where:

- x.x.x.x is the IP address or domain name of the host server on which you're running 
  the QEWD Container
- {name} is the name of a specific REST API

For example:

        http://192.168.1.100:8080/api/tags



## Quick Ping Test

*qewd-conduit* includes an additional REST API which you can send from a browser
to quickly check that it is properly up and running:


        http://x.x.x.x:8080/api/ping

For example:

        http://192.168.1.100:8080/api/ping


If QEWD is correctly running, you'll get the JSON response

        {pong: true}


## Optional: Try the QEWD-Monitor Application


You can check that your *qewd-conduit* instance is working correctly by running the
*qewd-monitor* application that will now have been installed:

Start the QEWD-Monitor application in your browser using the URL:

        http://x.x.x.x:8080/qewd-monitor

or try the latest version:

        http://x.x.x.x:8080/qewd-monitor-adminui


You'll need to enter the QEWD Management password.  Use the value that you
specified in the *managementPassword* property in the *qewd-conduit* *config.json* file.
The default/pre-configured value is *secret*.

You'll now see the Overview panel, from where you can monitor your QEWD run-time environment, view the master and worker process activity.

If the *qewd-monitor* application works correctly, then you can be sure that *qewd-conduit*
is working correctly and is ready for use.


## Running the *wc-conduit* RealWorld Client

Your *qewd-conduit* installation includes a pre-installed,
copy of the [*wc-conduit*](https://github.com/robtweed/wc-conduit)
RealWorld front-end client.  To run it, simply enter the following
URL into your browser:

        http://x.x.x.x:8080/conduit-wc

For example:

        http://192.168.1.100:8080/conduit-wc

It is pre-configured to use your *qewd-conduit* system's REST APIs.

If you want to compare your *qewd-conduit* back-end's operation with
another Conduit back-end, simply edit the *wc-conduit* *userSettings*
file that you'll find at:

        ~/qewd-conduit\www\conduit-wc\js\userSettings.js

The file contains self-explanatory comments that describe what you need to do to 
modify its configuration.

Alternatively, you can, of course, use any other of the available RealWorld front-ends: they
should all work identically with your *qewd-conduit* system, provided you
re-configure them to send their REST requests to your *qewd-conduit* back-end.


## Stopping QEWD

To stop the Docker Container, you should always use the command:

        cd ~/qewd-conduit
        ./stop

This cleanly and safely shuts down the database-connected QEWD Worker Processes


