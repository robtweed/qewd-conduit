# *config.json* Customisation

The *config.json* file contains a number of parameters that modify the behaviour of
QEWD.  The main ones are described below:

## PoolSize

        "poolSize": 2,

- *poolsize*: allows you to specify the maximum number of Worker Processes that QEWD will create.
Keep this at or below your Cach&eacute; or IRIS license limit.  Any excess traffic will be queued
until a Worker Process is available, so you will never run out of license slots when using QEWD.  
As a rough rule of thumb, start with the poolsize equal to one less than the number of CPU cores
you have available.  By default, the poolsize is 1.

  Note that if you are going to be running one or more of the other QEWD MicroServices on the same physical Windows system (ie in addition to the *Orchestrator*), then the SUM of poolsizes for all your
co-located QEWD instances MUST NOT exceed your total Cach&eacute; or IRIS license process limit.

## Port


        "port": 8080,

- *port*: the port on which QEWD's web server will listen. The *port* defaults to 8080.  If you are
going to be running one or more of the other QEWD MicroServices on the same physical Windows
system, each one (including the *Orchestrator*) **MUST** listen on a different port.


## Management Password


        "managementPassword": "secret",

- *managementPassword*: this is used by the *qewd-monitor* and *qewd-monitor-adminui* 
applications to authenticate its use.  Defaults to *keepThisSecret!*.  It is recommended that you always specify your own password to prevent anyone trying the default!


## Database Parameters


        "database": "IRIS",
        "path": "C:\\InterSystems\\IRIS\\Mgr",
        "username": "_SYSTEM",
        "password": "SYS",
        "namespace": "USER"


- the *database* parameters must be either *Cache* or *IRIS*, depending on which technology you
are using.  Note that the values are case-sensitive.

- the *path* parameter specifies the location of the *mgr* directory of your Cach&eacute; or IRIS
installation.  Note that the path MUST use doubled-up back-slash characters, since this value is
used in a JavaScript setting where a single back-slash character denotes that the following
character is to be escaped.

- the *username* and *password* settings may need changing from the default values shown, 
depending on how you've set up the security settings for your Cach&eacute; or IRIS system.

- change the *namespace* if required, to connect your QEWD Worker processes to a different
Cach&eacute; or IRIS namespace.

