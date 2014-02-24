angular.module('fv')
  .service('CONFIG', function() {
    this.defaults = {
      site: 'localhost:8080/master.html#/',
      recaptcha: '',
      parse: {
        applicationId:'6stx2NYQVpHKrlYL28NegU4vYAV76VRPWqMwAvZd',
        javascriptKey:'Exehq2ao7JVaSrq2LrBwPF1iehv8cYsGIKfBWsqS'
      },
      loginRadius: {
        apiKey: '6e958574-ee17-4818-9e58-233e15dfb90a'
      }
    }
  }
)
