"use strict";

angular.module('parseResource', []).factory('$parseResource', ['PARSE_CONFIG', '$http', function (PARSE_CONFIG, $http) {

  function parseResourceFactory(className, type) {
    if (_.isUndefined(type)) {
      type = 'class';
    }
    var config = angular.extend({
      BASE_URL : 'https://api.parse.com/1/'
    }, PARSE_CONFIG);

    var dataUrl = config.BASE_URL + "classes/" + className;
    var fileUrl = config.BASE_URL + "files/";
    var funcUrl = config.BASE_URL + "functions";
    var loginUrl = config.BASE_URL + 'login';
    var userUrl = config.BASE_URL + 'users';
    var roleUrl = config.BASE_URL + 'roles/';
    var defaultParams = config.defaultParams;
    if (Object.keys(defaultParams).length == 0) {
      defaultParams = null;       // Prevent angular from adding ? on a url with no parameters
    }
    var defaultHeaders = config.defaultHeaders;

    // post processing for REST operations
    var promiseThen = function (httpPromise, operation, $resource) {
      return httpPromise.then(function (response) {
        var result;
        if (response.data.hasOwnProperty("results")) {      // Transform array of results
          if (operation == "query") {
            result = Resource.resourceArray(response.data.results);
          }
          else if (operation == "queryCount") {
            result = response.data.count;
          }
        } else if (operation=="post") {
          $resource.objectId = response.data.objectId;    // Set new id on calling resource
          result = new Resource(response.data);
        } else if (operation=="operation") {
          result = response.data;                         // Don't create resource if no objects are returned
        }
        else {
          result = new Resource(response.data);
        }
        return result;
      }, function (response) {
        if (response.data!=undefined && response.data.hasOwnProperty("error") && response.data.hasOwnProperty("code")) {
          console.log("(" + operation + ", Parse " + response.data.code + ") " + response.data.error);
        }
        throw response;
      });
    };

    // my addition for helping to format an array of pointers
    var formatData = function(data) {
      angular.forEach(data, function(value, key) {
        if(Object.prototype.toString.call( value ) === '[object Array]') {
          var pointers = []
          for(var j = 0; j < value.length; j ++) {
            pointers.push({'__type':'Pointer', 'className':value[j].className, objectId: value[j].objectId});
          }
          data[key] = pointers;
        }
      });
      return angular.toJson(data);

    }

          
    //---------------------------------------------------------------
    // public static methods
    //---------------------------------------------------------------
    var Resource = function (data) {
      angular.extend(this, data);
    };
    Resource.url = function () {
      if (type === 'class') {
        return dataUrl;
      } else if (type === 'role') {
        return roleUrl;
      }
    } 
    // Basic REST operations
    Resource.get = function (id, queryParams) {
      if (id==undefined || id==null) {
        throw "invalid id for get"
      }
      var params = angular.isObject(queryParams)&&!angular.equals(queryParams,{}) ? queryParams : {};
      var httpPromise = $http.get(this.url() + '/' + id, {params:angular.extend({}, defaultParams, params),headers:defaultHeaders});
      return promiseThen(httpPromise, "get");
    };

    Resource.query = function (queryParams) {
      var params = angular.isObject(queryParams)&&!angular.equals(queryParams,{}) ? queryParams : {};
      var httpPromise = $http.get(this.url(), {params:angular.extend({}, defaultParams, params),headers:defaultHeaders});
      return promiseThen(httpPromise, "query");
    };

    Resource.queryCount = function (queryParams) {
      var params = angular.isObject(queryParams)&&!angular.equals(queryParams,{}) ? queryParams : {};
      params.count = 1;
      params.limit = 0;
      var httpPromise = $http.get(this.url(), {params:angular.extend({}, defaultParams, params),headers:defaultHeaders});
      return promiseThen(httpPromise, "queryCount");
    };

    Resource.saveFile = function (filename, data, contentType) {
      var url = fileUrl + filename;
      var headers = angular.extend({"Content-Type" : contentType.type}, defaultHeaders);
      var httpPromise = $http.post(url, data, {params:defaultParams,headers:headers});
      return promiseThen(httpPromise, "get");
    };

    // login a user (my addition)
    Resource.login = function (data) {
      var url = loginUrl;
      var httpPromise = $http.get(url, {params: angular.extend({}, defaultParams, data), headers: defaultHeaders});
      return promiseThen(httpPromise, "get");
    };

    // register a user (my addition)
    Resource.register = function (data) {
      var url = userUrl;
      var resource = Resource.create(data);
      data = angular.toJson(data);
      var httpPromise = $http.post(url, data, {params: defaultParams, headers: defaultHeaders});
      return promiseThen(httpPromise, "post", resource);
    }
   // register a user (my addition)
    Resource.update = function (id, data) {
      if (id==undefined || id==null) {
        throw "invalid id for get"
      }
      var url = userUrl;
      var resource = Resource.create(data);
      data = angular.toJson(data);
      var httpPromise = $http.put(url + '/' + id, data, {params: defaultParams, headers: defaultHeaders});
      return promiseThen(httpPromise, "put", resource);
    }
    // Call Cloud Code function
    Resource.call = function (functionName, functionParams) {
      var data = angular.isObject(functionParams)&&!angular.equals(functionParams,{}) ? functionParams : {};
      var httpPromise = $http.post(funcUrl + '/' + functionName, data, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "function");
    }

    // Create Parse pointer from an id, object, or array of objects
    Resource.pointer = function (object) {
      if (object == undefined || object == null) {
        throw "pointer must be defined";
      }
      if (Array.isArray(object)) {
        var p = [];
        object.forEach(function(item) {
          p.push(Resource.pointer(item));
        })
        return p;
      }
      else {
        var p = {};
        p.__type = "Pointer";
        p.className = className;
        if (object.hasOwnProperty("objectId")) {
          p.objectId = object.objectId;   // pointer from object
        }
        else {
          p.objectId = object;            // pointer from id
        }
        return p;
      }
    }

    Resource.create = function(data) {
      var resource = new Resource(data);
      return resource;
    }

    Resource.resourceArray = function(data) {
      var result = [];
      if (data == undefined) {
        return result;
      }
      for (var i = 0; i < data.length; i++) {
        if (data[i] == null) {
          continue;
        }
        if (data[i].hasOwnProperty("__type")) {
          delete data[i].__type;
        }
        if (data[i].hasOwnProperty("className")) {
          delete data[i].className;
        }
        result.push(new Resource(data[i]));
      }
      return result;
    }

    Resource.newOp = function (property, operation, items) {
      var data = {};
      data[property] = {};
      data[property].__op = operation;
      if (items != undefined) {
        data[property].objects = items;
      }
      return data;
    }

    Resource.arrayAddUnique = function (objectId, arrayProperty, items) {
      items = [].concat(items);
      var op = Resource.newOp(arrayProperty, "AddUnique", items);
      var httpPromise = $http.put(this.url() + "/" + objectId, op, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "operation");
    }

    Resource.arrayRemove = function (objectId, arrayProperty, items) {
      items = [].concat(items);
      var op = Resource.newOp(arrayProperty, "Remove", items);
      var httpPromise = $http.put(this.url() + "/" + objectId, op, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "operation");
    }

    // add the parse session token to the list of headers (my addition)
    Resource.user = function(sessionToken) {
      defaultHeaders['X-Parse-Session-Token'] = sessionToken;
    }

    // remove the parse session token from the list of headers (my addition)
    Resource.logout = function(sessionToken) {
      delete defaultHeaders['X-Parse-Session-Token'];
    }

    //validate a sessionToken
    //TODO: make this more useful and integrate with Auth
    Resource.validate = function(sessionToken) {
      defaultHeaders['X-Parse-Session-Token'] = sessionToken;
      var httpPromise = $http.get(userUrl + "/me", {params: defaultParams, headers: defaultHeaders});
      return promiseThen(httpPromise, "get");
    }

    //---------------------------------------------------------------
    // public instance methods
    //---------------------------------------------------------------
    Object.defineProperty(Resource.prototype, "$id", {get : function() {
      if (this.hasOwnProperty("objectId")) {
        return this.objectId;
      }
      else
        return null;
    }, enumerable : true});

    // Basic REST operations
    Resource.prototype.$get = function (id, queryParams) {
      return Resource.get(id, queryParams);
    }

    Resource.prototype.$post = function () {
      var data = angular.toJson(this);
      var httpPromise = $http.post(this.url(), data, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "post", this);
    };

    Resource.prototype.$put = function () {
      var data = angular.toJson(this);
      var httpPromise = $http.put(this.url() + "/" + this.$id, data, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "put", this);
    };

    Resource.prototype.$delete = function () {
      var httpPromise = $http['delete'](this.url() + "/" + this.$id, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "delete", this);
    };

    Resource.prototype.$deleteProperty = function (property) {
      var op = Resource.newOp(property, "Delete");
      var httpPromise = $http.put(this.url() + "/" + this.$id, op, {params:defaultParams,headers:defaultHeaders});
      return promiseThen(httpPromise, "operation", this);
    };

    Resource.prototype.$query = function (queryParams) {
      return Resource.query(id, queryParams);
    }

    Resource.prototype.$pointer = function () {
      return Resource.pointer(this);
    }

    // Get a parse date/time property as a moment.js instance
    Resource.prototype.$getMoment = function(dateProperty) {
      if (this.hasOwnProperty(dateProperty)) {
        return new moment(this[dateProperty].iso);
      }
      else {
        return null;
      }
    };

    // Get a parse date/time property as a Javascript Date instance
    Resource.prototype.$getJsDate = function(dateProperty) {
      var date = new Date(Date.parse(this[dateProperty].iso));
      return date;
    };

    // Set a parse date/time property from a Javascript Date instance
    Resource.prototype.$setJsDate = function(dateProperty, date) {
      this[dateProperty] = {"__type": "Date","iso": date.toISOString()};
    };

    // Set a parse date/time property from year/month/day values
    Resource.prototype.$setDate = function(dateProperty, year, month, day) {
      var date = new Date(year,month,day);
      this[dateProperty] = {"__type": "Date","iso": date.toISOString()};
    };

    // Determine if this is a new resource (my addition)
    Resource.prototype.$isNew = function() {
      return !('objectId' in this);
    }

    Resource.prototype.$call  = function (functionName  , functionParams) {
      return Resource.call(functionName, functionParams);
    }

    Resource.prototype.$saveFile = function (fileName, data, contentType) {
      return Resource.saveFile(fileName, data, contentType);
    }

 
    return Resource;
  }

  return parseResourceFactory;
}]);
