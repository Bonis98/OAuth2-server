const OAuthServer = require('express-oauth-server')
const model = require('./model')

module.exports = new OAuthServer({
  model:model,
  accessTokenLifetime: 60 * 60 * 24,
  grants: ['authorization_code']
})
