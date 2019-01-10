# Up-time resource monitoring node.js API
This API was built without any npm module!
It allows a user to enter the URL's they want to be monitored, and receive alerts when this resource go _down_ and _come back_

[Explore API](https://web.postman.co/collections/3368587-2e0ee175-4293-4ee9-9847-f455623a685b?workspace=8358da19-19c9-45ba-8d76-2d6bc9d62598)


#### NOTES:
 - Run every command in root directory

 - Scafolding
    - ```.data``` - here is storing all data about (tokens, checks, users)

    - ```.logs``` - here is storing logs (name of logs equals to log id) and archived logs

    - ```https``` - put your key and cert to run https server

 - Every time you start the app the following will happen
    - All checks will be immediately executed

    - The loop will be started so the checks will execute later on

    - Each check log file will be compressed immediately

    - Each check log file will be truncated

    - The logs compression loop will be started
## CLI

Start application (default in ***dev*** mode)
```javascript
$ node index.js
```

Start application and view logs from ***server***
```console
$ NODE_DEBUG=server node index.js

Workers have successfully started
The server is up on port 3000 and running in dev mode
The server is up on port 3001 and running in dev mode
SERVER 10795: GET /  200
SERVER 10795: GET / public/app.js 200
SERVER 10795: GET / public/app.css 200
SERVER 10795: GET / public/logo.png 200
```

Start application and view logs from ***workers***
```console
$ NODE_DEBUG=workers node index.js

Workers have successfully started
The server is up on port 3000 and running in dev mode
The server is up on port 3001 and running in dev mode
WORKERS 14429: Success truncating log file
WORKERS 14429: Logging to file succeded
WORKERS 14429: Outcome has not changed no alert is needed
```

Start application in ***production*** mode
```console
$ NODE_ENV=production node index.js

Workers have successfully started
The server is up on port 5000 and running in production mode
The server is up on port 5001 and running in production mode
```
