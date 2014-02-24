angular.module('fv')
  .service('CONFIG', function() {
    this.defaults = {
      site: 'myfamilyvoice.com/master.html#/',
      recapthca: '6LeYE-8SAAAAAGus2KbW17hov-MPs2Y9xHLDQF1k',
      parse: {
        applicationId:'KXVXmiKlrlc3yUNH7vBEFXuvfbd9piFDBXnMLhJE',
        javascriptKey:'FukDDv3umPZjy7nCD9nZbqABXzXNmj0eps5H2v2V'
      },
      loginRadius: {
        apiKey: 'f36321df-34bc-4c0a-9a0b-aac96ccfa9ac'
      }
    }
  }
)
