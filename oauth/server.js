const OAuthServer = require('express-oauth-server')
const model = require('./model')

module.exports = new OAuthServer({
  model:model,
  grants: ['authorization_code', 'refresh_token']
})
