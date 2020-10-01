# Installing and Running *qewd-conduit* with IRIS on Windows

## Contents

- [Introduction](#introduction)
- [Initial Steps](#initial-steps)
- [Installing *qewd-conduit*](#installing-qewd-conduit)


----

# Introduction

The instructions below explain how to installl and run the *qewd-courier* Back-end,
 running on Windows with the IRIS database.

----

# Initial Steps

## Ensure the C Callin Service is Enabled

QEWD uses the [*mg-dbx*](https://github.com/chrisemunt/mg-dbx) 
module to integrate with Cach&eacute; and IRIS, and *mg-dbx* requires the
C Callin Interface to be enabled on IRIS.

To check and/or change this, open the IRIS System Management Portal in the usual way.

Next, navigate the System Management Portal menus as follows:

- System Administration
  - Security
    - Services
      - %Service_Callin: Click on the link, then:

- Check the *Service Enabled* box and Click *Save*


## Install Node.js

You first need to [install Node.js](https://nodejs.org) on your Windows machine(s). Node.js versions 12.x and 14.x are supported.

Do not install earlier versions of Node.js, and if you already have an earlier version of Node.js
installed, you will need to update it.

## Install *git*

You'll need to ensure that you can clone the *qewd-conduit* Github Repository, so make sure
you have [*git* installed](https://git-scm.com) on your Windows system.


# Installing *qewd-conduit*


## Clone the *qewd-conduit* Github Repository

It's up to you to decide where to install *qewd-conduit* within your Windows' directory
structure.  In this document I'm going to assume you'll install it in a folder directly
under your *C:\* drive.  Adjust any paths described in this document appropriately if you
decide to install in some other drive/directory path.

In a Windows Command Prompt window, type the following:

        cd c:\
        git clone https://github.com/robtweed/qewd-conduit


On completion, you should now have a structure that includes:

        C:\qewd-conduit
            |
            |_ apis
            |
            |_ conduit
            |
            |_ configuration
            |
            |_ package.json


You'll also see some other folders and files, but these are used for other *qewd-conduit*
configurations and platforms, so they can be ignored.


## Edit the QEWD Configuration JSON file

If you look in the *configuration* sub-folder, you'll find a number of files, in particular:


        C:\qewd-conduit
            |
            |_ configuration
                 |
                 |- config.json
                 |
                 |- config.json.iris


Delete the *config.json* file and rename *config.json.iris* to *config.json*

You'll need to check the IRIS connection settings in your renamed *config.json* file.
If you open it in an editor, you'll see that it contains:

        {
          "qewd": {
            "port": 8080,
            "poolsize": 2,
            "serverName": "QEWD Conduit Server",
            "managementPassword": "secret",
            "cors": true,
            "database": {
              "type": "dbx",
              "params": {
                "database": "IRIS",
                "path": "C:\\InterSystems\\IRIS\\mgr",
                "username": "_SYSTEM",
                "password": "SYS",
                "namespace": "USER"
              }
            }
          }
        }

If necessary, change the *path*, *username*, *password* values to
correspond with your IRIS system's configuration.  

If you want to
use a different namespace for the *qewd-conduit* Global storage, 
modify the *namespace* value.

Otherwise the settings in this file can be left as they are until you
become more familiar with using QEWD.  The customisable settings
(*port*, *poolSize*, *serverName* and *managementPassword*) are
[described here](./CONFIG.md).

 **Note:** If you are using the free Community Edition of IRIS, you'll find that QEWD will
run very nicely with a *poolSize* of 2.  If you want to run IRIS Terminal and/or
IRIS Studio whilst also running QEWD, this is pretty much the *poolSize* limit,
but feel free to experiment.  Even with a *poolSize* of 2, you'll find the
performance and throughput of *qewd-conduit* will be more than adequate for even
quite large numbers of concurrent client users.


## Install QEWD

Everything is now ready for use, but first we must install QEWD and its
dependencies. This step only needs doing once.


In a Windows Command Prompt window, type the following:


        cd C:\qewd-conduit

        npm install


You'll see it installing QEWD, and in the QEWD Installation folder (*c:\qewd-conduit*), 
you'll see a sub-folder named *node_modules* and a file named *package-lock.json* appear, 
eg your top-level folder structure should now include:


        C:\qewd-conduit
            |
            |_ apis
            |
            |_ conduit
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


 **IMPORTANT:** If you are using the free Community Edition of IRIS, you need to 
make sure that enough IRIS license slots are available for the next step.  It is
recommended that you close IRIS Terminal and Studio, and log out of the
IRIS System Management Portal.


Start QEWD for the first time as follows:

        cd C:\qewd-conduit

        npm start

You will almost certainly get a Windows Defender Firewall dialog box appearing,
asking you if you want to allow incoming connections from Node.js.  You should
accept/allow these connections and the QEWD installation will commence.

The first time you start QEWD, it installs a bunch of extra things, so you'll see
new sub-folders named *www* and *qewd-apps* appear. QEWD has loaded in everything you need
for monitoring your system and for developing interactive applications if you wish to do so.

When you're running QEWD with Cach&eacute; or IRIS on Windows, it will also have
automatically downloaded and installed the correct version of the
[*mg-dbx*](https://github.com/chrisemunt/mg-dbx) interface along with its associated
ObjectScript code interface for Cach&eacute; or IRIS SQL.

After this initial installation has completed, QEWD will stop and ask you
to restart.

*qewd-conduit* is now ready for use.


# Running *qewd-conduit*


## Starting QEWD

Each time you want to start QEWD, first make sure you're in your QEWD Installation folder, eg

        cd \qewd-conduit

and then start QEWD by typing:

        npm start


QEWD is ready for use when you see this (the poolsize and port will depend on your *config.json* settings):



        webServerRootPath = C:\qewd-orchestrator/orchestrator/www/
        route /api will be handled by qx.router
        Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
        ========================================================
        ewd-qoper8 is up and running.  Max worker pool size: 2
        ========================================================
        ========================================================
        QEWD.js is listening on port 8080
        ========================================================



## Accessing the *qewd-conduit* REST APIs

The REST APIs can be accessed via HTTP requests to the following endpoint:

        http://x.x.x.x:8080/api/{name}

where:

- x.x.x.x is the IP address or domain name of the server on which you're running QEWD
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


You can check that your *Orchestrator* instance is working correctly by running the
*qewd-monitor* application that will now have been installed:

Start the QEWD-Monitor application in your browser using the URL:

        http://x.x.x.x:8080/qewd-monitor

or try the latest version:

        http://x.x.x.x:8080/qewd-monitor-adminui


You'll need to enter the QEWD Management password.  Use the value that you
specified in the *managementPassword* property in your *Orchestrator's* *config.json* file.

You'll now see the Overview panel, from where you can monitor your QEWD run-time environment, view the master and worker process activity.

If the *qewd-monitor* application works correctly, then you can be sure that the *Orchestrator*
is working correctly and is ready for use.


## Stopping QEWD

To shut down the *qewd-conduit* Back-end you must stop QEWD.

If you're running QEWD in a foreground window process, simply type CTRL & C


Alternatively, you can stop QEWD by using the *qewd-monitor* or *qewd-monitor-adminui* applications.
For example:  

- In a browser, start it up:

        http://192.168.1.100:8080/qewd-monitor-adminui

        Note: change the IP address & port to match your server and QEWD configuration

- Login using the management password that you specified in the *config.json* file.

- Click the red X button in the Master Process Title bar


## Running *qewd-conduit* as a Service

There are a number of ways to set up *qewd-conduit* to run as a Windows Service.
[Read this document](https://www.slideshare.net/robtweed/ewd-3-training-course-part-29-running-ewdxpress-as-a-service-on-windows)
 for details of one potential option.


