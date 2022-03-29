const path = require('path') // has path and __dirname
const express = require('express')
const functions = require('../utilities/supportFunctions')

const DebugControl = require('../utilities/debug.js')

const oauthServer = require('../oauth/server')

const router = express.Router() // Instantiate a new router

const filePath = path.join(__dirname, '../public/oauthAuthenticate.html')

router.get('/authorize', (req,res) => {  // send back a simple form for the oauth
  res.sendFile(filePath)
})

//Get auth code
router.post('/authorize', (req,res,next) => {
  functions.authenticateUser(req.body.username, req.body.password, function(err, result){
    if (!result || err) {
      const params = [ // Send params back down
      'client_id',
      'redirectUri',
      'response_type',
      'grant_type',
      'state',
      'username',
      ]
      .map(a => `${a}=${req.body[a]}`)
      .join('&')
      if (err === 'User is not registered') res.redirect(`/oauth/authorize?user=false&${params}`)
      else if (!result) res.redirect(`/oauth/authorize?success=false&${params}`)
      else res.redirect(`/oauth/authorize?error=true&${params}`)
    }
    else next()
  })
}, (req, res, next) => {
  DebugControl.log.flow('authorize')
  return next()
  },
  oauthServer.authorize({
    authenticateHandler: {
      handle: req => {
        return req.body.username
      }
    }
  })
)

//Get token from auth code
router.post('/token', (req,res,next) => {
  DebugControl.log.flow('Token')
  next()
},oauthServer.token())  // Sends back token

module.exports = router
