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
*  Social login w/ 4 providers Google, Twitter, Facebook, Linkedin
*  admin@myfamilyvoice.com 

## Mandrill
*  Email sending

## MailChimp
*  Used to create Template that is sent to Mandrill

## Pivitol Labs - Kaban
   admin@myfamilyvoice.com
   $7/mo

####################################################
# Registration
* Social Login
*   loginRadius 
*      create registerUser with provideId and provider password (guid) username (guid)
*      create user with firstName, LastName, primaryEmail (if available as Twitter does not provide)
*         user: password and username are registerUser.username/password
          user: verifiedEmail is false
*      goto Account.html and verify contact info
*      send Email verifcation
*      set user verifiedEmail true
* Regular
*   accept FirstName, LastName, Email
*   send Email verification      
*   set user verifiedEmail true

# Login
*  Social Login
*    read registeredUser, using ProvideID and Provider
*    return registeredUser.username/password
*    login 
*  Regular
*    normal

# Logo
*   http://cooltext.com/
*   Use Google admin@myfamilyvoice.com account

# Admin
*   /admin
*   

# Security 
* Registered
*    can see all users
* Verified Email
*    can listen to audio
*    can friend someone
*    can accept/reject friend request
*    can create/delete questions on self
*    can delete/ignore/answer questions from others
* Friended
*    can ask questions of friend
*    can delete their own questions
* Subscribe
     notified of new audio 

# Things to do
* Search
*   Multiple options
*   Pagination
*   Splitting words out for better indexing 
*
# Adsense
*   Setup account and place on search results page
*
# Invitation email
*   Ability to ask questions before invite is accepted
*   Have link established from email
*   When registered, questions are waiting
*
# Notifications / Stats
*   How big is family/suscribers
*   How many questions un/answered
*   How many listens
*   Family requests pending
*
# Account 
*   Upload picture (done)
*   Resize picture to thumbnail for search results (done)
*   Support flagging as inappropriate
*   Show all subscriptions to/from
*   Show stats: questions asked/answered/viewed
*   Unsubscribe
*
# Questions
*   countdown timer
*   private recipient
*   Support flagging as inappropriate
*
# Background jobs
*   Clear out SID, ConfirmEmail, etc
*
# Security
*   Lock down 
*
# Production
*   Logging (paperTrail)
*   Minification
*
# Admin
*   Create test data
*   Cancel membership
*   Edit accounts
*
# Site cleanup
*   FAQ
*   Pictures / testimony
*   More instructions
*   Video instructions
*
# FAQ
*   notes for everyone
*
# Test verification
*   How to know everything is working properly 

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

