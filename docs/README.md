##Overview
MyFamilyVoice records the voice of your family for future generations

## Parse.com
* server side code
*   parse deploy - pushes cloud/main.js
*   parse log -n 100 FamilyVoice >log.txt
*   barton@acclivyx.com

## Twilio
* Voice for questions
* barton@acclivyx.com

## Harp.io
*  Site hosting
*  grunt harp
*  mozilla.persona barton@acclivyx.com
*  https://login.persona.org/
  
## IWantMyName.com - domain
*  barton@acclivyx.com  

## Google apps
*  admin@myfamilyvoice.com
*  $50/yr

## LoginRadius
*  admin@myfamilyvoice.com 

## SSL process
openssl req -out CSR.csr -new -newkey rsa:2048 -nodes -keyout privateKey.key
Generating a 2048 bit RSA private key
............................................................+++
................+++
writing new private key to 'privateKey.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:US
State or Province Name (full name) [Some-State]:Texas
Locality Name (eg, city) []:Austin
Organization Name (eg, company) [Internet Widgits Pty Ltd]:MyFamilyVoice
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:*.myfamilyvoice.com
Email Address []:admin@myfamilyvoice.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:Orthod0x
An optional company name []:

