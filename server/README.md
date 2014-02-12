## node server

## requirements
* install node so that npm is available see http://nodejs.org
* run "npm install"

## running server
* enter command "node server.js standalone|proxy [log [name]]"
*  Typical usage:
*  1) record
*  a) e.g. node server/server.js proxy log -> this outputs to test/api which is under source control
*  b) e.g. node server/server.js proxy log barton -> this outputs to test/barton/api which should be ignored
*  2) standlone
*  a) e.g. node server/server.js standalone -> will use test/api
*  b) e.g. node server/server.js standalone log barton -> will use the test/barton/api recorded above


## notes
* This supports proxying the 'api/v1/*' requests to the defined lynx-server.
* Run the server.js with a parameter of either "standalone" or "proxy".
* The node server will serve up all the static content always.
* If running in "standalone" mode, it works as before serving all the requests locally.
* If running in "proxy" mode, the node server reads in the server/proxyOptions.js file to determine the host:port as the target and an array of "api/v1/xxx" calls to proxy.
* Modify this file to point to the appropriate host and modify the array to alter which calls to proxy.

## browser
* open to https://localhost:8000/
* NOTE: everything is over SSL so always use https