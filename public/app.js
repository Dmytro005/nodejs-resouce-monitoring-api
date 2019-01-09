/**
 * 
 * Fronted logic for the application
 * 
 */
const app = {};

// Config
app.config = {
    sessionToken: false,
}

// Ajax client for the restfull api

app.client = {};


app.client.request = function(headers, path, method, queryStringObject, payload, callback) {

    // Set defaults
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;

    // Add query string params to the path
    const requestUrl = path+'?';
    let counter = 0;
    for(let queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
        counter++;

        if(counter > 1){
            requestUrl+='&';
        }

        requestUrl+=queryKey+'='+queryStringObject[queryKey];
        }
    }


    const xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);

    // Set headers
    xhr.setRequestHeader("Content-Type", "application/json");
    for(let key in headers) {
        if(headers.hasOwnProperty(key)){
            xhr.setRequestHeader(key, headers[key]); 
        }
    }

    // Set authorization token if it exists
    if(app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id)
    }

    // Handle the request response
    xhr.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            const statusCode = xhr.status;
            const responseReturned = xhr.responseText;

            // Callback if it is provided
            if(callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (error) {
                    callback(statusCode, false);
                }
            }

        }
    }

    // Send payload
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}
