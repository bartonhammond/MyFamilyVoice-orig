var URI = require('url');

var endpointdomain = 'hub.loginradius.com';
var schema ='https';

/** callback handler, excutes after successfully get data
 * @name CallbackHandler
 * @function
 * @param {Boolean} is sucessfully received data (or authorized to get data)
 * @param {String} received data from LoginRadius API
 */

/** LoginRadius Authentication function
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.socialAuthentication = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/userprofile.ashx?token=' + token + '&apisecrete=' + secret;
  return httpGetRequest(url);
}

/** function is use to get User's contacts. It returns contacts in the List format
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getUserContacts = function (token, secret) {
  var url = schema + '://' + endpointdomain + '/contacts/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get User's Events from their Facebook profile
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getEvents = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/getevents/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get User's Groups in list format
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getGroups = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/getgroups/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to send direct message
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 * @param sendto {String} friends id to send message
 * @param subject {String} subject of message
 * @param message {String} body of message
 */
exports.sendDirectMessage = function (token, secret, sendto, subject, message) {
  var url = schema +'://' + endpointdomain + '/directmessage/' + secret + '/' + token + '?sendto=' + encodeURIComponent(sendto) + '&subject=' + encodeURIComponent(subject) + '&message=' + encodeURIComponent(message);
  return httpGetRequest(url);
}

/** function is use to post/update status on user's facebook wall
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 * @param parameters {Object} object of string properties 
 */
exports.setStatusMessage = function (token, secret, parameters) {
  var url = schema +'://' + endpointdomain + '/status/update/' + secret + '/' + token + '?to=' + encodeURIComponent(parameters.to) + '&title=' + encodeURIComponent(parameters.title) + '&url=' + encodeURIComponent(parameters.url) + '&imageurl=' + encodeURIComponent(parameters.imageurl) + '&status=' + encodeURIComponent(parameters.status) + '&caption=' + encodeURIComponent(parameters.caption) + '&description=' + encodeURIComponent(parameters.description);
  return httpGetRequest(url);
}


/** function is use to get User Status messages
 * @function
 * @public
 * @param token {tokenString} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getStatusMessages = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/status/get/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get user's Mentions from Twitter
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getMentions = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/status/mentions/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get user's TimeLine
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getTimelineFeed = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/status/timeline/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get User's Posts in list format
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getPosts = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/getposts/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get user's followed companies from LinkedIn in list format
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getCompanies = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/getcompany/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to get user's raw (as provider return) user profile
 * @function
 * @public
 * @param token {String} Authentication token 
 * @param secret {String} LoginRadius API Secret
 */
exports.getRawUserprofile = function (token, secret) {
  var url = schema +'://' + endpointdomain + '/rawuserprofile/' + secret + '/' + token;
  return httpGetRequest(url);
}

/** function is use to do HTTP GET request
 * @function
 * @public
 * @param url {String} Url/Endpoint to make request
 */
function httpGetRequest(url) {
  return Parse.Cloud.httpRequest({url: url});
}
