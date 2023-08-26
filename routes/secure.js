const express = require('express')
const router = express.Router() // Instantiate a new router
const DebugControl = require('../utilities/debug.js')
const mongodb = require('../utilities/supportFunctions.js')

router.get('/', (req,res) => {  // Successfully reached if can hit this :)
  DebugControl.log.variable({name: 'res.locals.oauth.token', value: res.locals.oauth.token})

  // implementare qui la chiamata alla funzione mongodb che mi restituisce lo username
  //const result = mongodb.getUserName(req.headers.access_token);
  //res.send(result);


  //res.json({"message":"Access to protected resource granted!"})
})

module.exports = router
