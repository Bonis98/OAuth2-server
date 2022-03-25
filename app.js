const express = require('express')

const app = express()
const port = 443
const bodyParser = require('body-parser')
const oauthServer = require('./oauth/server.js')

const DebugControl = require('./utilities/debug.js')

const http = require('http')
const https = require('https')

const fs = require('fs')

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(DebugControl.log.request())

//Redirect all http requests to https
app.all('*', function(req, res, next){
  if (req.secure) return next()
  res.redirect(307, 'https://' + req.hostname + req.url)
})

app.use('/client', require('./routes/client.js')) // Client routes
app.use('/user', require('./routes/user.js')) // user routes
app.use('/oauth', require('./routes/auth.js')) // routes to access the auth stuff
// Note that the next router uses middleware. That protects all routes within this middleware
app.use('/secure', (req,res,next) => {
  DebugControl.log.flow('Authentication')
  return next()
},oauthServer.authenticate(), require('./routes/secure.js')) // routes to access the protected stuff

http.createServer(app).listen(80)
https.createServer({
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert'),
}, app).listen(port)
console.log("Oauth Server listening on port ", port)

module.exports = app // For testing
