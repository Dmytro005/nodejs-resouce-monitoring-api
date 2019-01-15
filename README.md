# Up-time resource monitoring node.js app
This API was built without any npm module!
It allows a user to enter the URL's they want to be monitored, and receive alerts when this resource go _down_ and _come back_

## API

   API is hosting on localhost:***port***/api

   [Explore DOCS](https://web.postman.co/collections/3368587-2e0ee175-4293-4ee9-9847-f455623a685b?workspace=8358da19-19c9-45ba-8d76-2d6bc9d62598)

## Run the application

#### NOTES: Run every command in root directory
Start application (default in ***dev*** mode)
```javascript
$ node index.js
```
Start application in ***production*** mode
```console
$ NODE_ENV=production node index.js
```

Start application and view logs from ***server***
```console
$ NODE_DEBUG=server node index.js
```

Start application and view logs from ***workers***
```console
$ NODE_DEBUG=workers node index.js
```

Start application and view logs about functions ***performance***
```console
$ NODE_DEBUG=performance node index.js
```

## Run the tests

```console
$ node test
```

## CLI tools

Command | Action
------------ | -------------
```exit``` | Kill the CLI (and the rest of the application)
```man``` | Show this help page
```help``` | Alias of the 'man' command
```stats``` | Get statistics on the underlying operating system and resource utilization
```list users``` | Show a list of all the registered (undeleted) users in the system
```more user info --{userId}``` | Show details of a specified user
```list checks --up --down``` | "Show a list of all the active checks in the system, including their state. The '--up' and '--down flags are both optional.'",
```more check info --{checkId}``` | Show details of a specified check
```list logs``` | Show a list of all the log files available to be read (compressed only)
```more log info --{logFileName}``` | Show details of a specified log file

