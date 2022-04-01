const path = require('path') // has path and __dirname
const express = require('express')
const router = express.Router()
const functions = require('../utilities/supportFunctions')

router.get('/register', (req,res) => res.sendFile(path.join(__dirname, '../public/clientRegistration.html')))

router.post('/register', (req,res) => {
	//Convert grants String to array
	const grants = req.body.grant.slice(0, -1).split(';')
	functions.registerClient(grants, req.body.redirect_uri).then(
		function(suc){
			res.json({
				clientId: suc.clientId,
				clientSecret: suc.clientSecret
			})
		},
		function(err){
			res.send(err)
		})
})

module.exports = router
