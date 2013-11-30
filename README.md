angular-parse-app
=================

An exploration of AngularJS and Parse.com

This is the first little app that I've build with AngularJS and Parse.com as a backend service. It's a simple "activity log" that allows you to create posts tagged with dates and tags. 

I found learning Angular with very little JS knowledge quite difficult. Things are moving so quickly, even SO questions from a year ago are obsolete. Anyway, I'm hoping this will help others who are just diving into the JS framework realm like I was a few months ago. I would like this to grow into a resource for beginners (such as myself) so all questions, comments and concerns are encouraged!

Features:

- Parse.com integration
-   User registration/login
-   Private user data
-   Class relations
-   ACL implementation
- Sample directive using non-angular JS plugins (WYSIWYG editor)
- Access rights to routes
- Other things that I found useful to learn that I can't think of right now

Installation:

The app is created with yeoman (http://yeoman.io/) so make sure you have grunt and bower installed.

- Clone the repository
- Change the Parse ApplicationID and REST API keys in app/scripts/app.js
- Move to the project directory and run the following commands
- npm install
- bower
- grunt serve

It should open a new tab in Chrome.

TODO:

- I'm sure there are still lots of bugs
- TESTING - figure out how to implement tests for this (any help greatly appreciated!)

Credits:

The following resources were a great help while building this.

- Yeoman (http://yeoman.io/) introducing a build script and a slightly opinionated structure helps get off the ground
- Awesome Parse resource (https://github.com/WhitneyLand/Papp) - still haven't figured out how to use it all
- Angular collection (https://github.com/tomkuk/angular-collection)
- Countless blogs and SO questions and answers