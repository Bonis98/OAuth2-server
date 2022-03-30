const path = require('path') // has path and __dirname
const express = require('express')
const router = express.Router()
const functions = require('../utilities/supportFunctions')

router.get('/', (req,res) => res.sendFile(path.join(__dirname, '../public/userRegistration.html')))

router.post('/register', (req,res) => {
	if(req.body.password == req.body.confirm){
		functions.registerUser(req.body.username, req.body.password, req.body.name, 
			function(err, user){
				if (err) res.send(err)
				else res.send(user)
			}
		)
	}
	else res.send("password and confirm password do not match")
})

module.exports = router
