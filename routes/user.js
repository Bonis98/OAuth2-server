const path = require('path') // has path and __dirname
const express = require('express')
const router = express.Router()
const functions = require('../utilities/supportFunctions')

router.get('/', (req,res) => res.sendFile(path.join(__dirname, '../public/userRegistration.html')))

router.post('/register', (req,res) => {
	functions.registerUser(req.body.username, req.body.password, req.body.name, 
		function(err, user){
			if (err) res.send(err)
			else res.send(user)
		})
})

module.exports = router
