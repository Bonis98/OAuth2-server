const path = require('path') // has path and __dirname
const express = require('express')
const router = express.Router()
const functions = require('../utilities/supportFunctions')

router.get('/', (req,res) => res.sendFile(path.join(__dirname, '../public/clientRegistration.html')))

router.post('/register', (req,res) => {
	functions.registerClient(req.body.grant, req.body.redirect_uri).then(
		function(suc){
			res.json({
				clientId: suc.clientId,
				clientSecret: suc.clientSecret
			})
		},
		function(err){
			console.error(err)
			res.send(err)
		})
})

module.exports = router
