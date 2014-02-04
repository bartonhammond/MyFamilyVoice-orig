
var fs = require('fs');
var _ = require('underscore');

var webdriver = require('selenium-webdriver');
var harpIO = require('./harpIOConfig.js');

printUsage = function() {
  console.log('Please provide parameter dev or prod');
  console.log('e.g. node publishHarpIO dev|prod');
  process.exit(1);
}

if (process.argv[2] !== 'prod'
  && process.argv[2] !== 'dev') {
  printUsage();
}

var driver = new webdriver.Builder().
   withCapabilities(webdriver.Capabilities.chrome()).
   build();

//Get link to specific app
driver.get(harpIO.config[process.argv[2]].url);

//This pops up the Mozilla Persona Login window
driver.findElement(webdriver.By.css('.btn.btn-info.btn-large.auth-link')).click();

driver.sleep(3000);

//Switch to Mozilla window
driver.getAllWindowHandles()
  .then(
    function(windows) {
      driver.switchTo().window(_.last(windows));
    });

//Enter username
driver.findElement(webdriver.By.id('authentication_email')).sendKeys(harpIO.config.email);
driver.findElement(webdriver.By.css('.isDesktop.isStart.isAddressInfo')).click();

driver.sleep(2000);

//Enter password
driver.findElement(webdriver.By.id('authentication_password')).sendKeys(harpIO.config.password);
driver.findElement(webdriver.By.id('authentication_password')).sendKeys(webdriver.Key.ENTER);

driver.sleep(10000);

//Switch back to main window
driver.getAllWindowHandles()
  .then(
    function(windows) {
      driver.switchTo().window(_.first(windows));
    });

//Now go to
driver.get(harpIO.config[process.argv[2]].url);

//Click the Publish button
driver.findElement(webdriver.By.css('.btn.btn-primary.appmenu-publish-btn.js-build-app.effeckt-button')).click();

driver.sleep(5000);

driver.quit();

