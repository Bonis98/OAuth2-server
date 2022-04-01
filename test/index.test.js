let chai = require('chai')
let should = require('chai').should()
let chaiHttp = require('chai-http')

chai.use(chaiHttp)

const {server} = require('./setup.js')

let validData = {
  code: '',
  tokenFrom: {
    code: '',
    refresh: '',
    refreshedRefresh: '',
  },
  refreshToken: '',
}

const userTypes = [
  {valid: true, type:'valid', name: 'example', username: 'username', password: 'password', confirm: 'password'},
  {valid: false, type:'invalid', name: 'example', username: 'user', password: 'pass', confirm: 'password'},
]

const clientTypes = [
  {valid: true, type:'valid', redirect_uri: 'http://example.com', grants: 'authorization_code;'},
  {valid: false, type:'invalid', redirect_uri: 'invalid', grants: 'authorization_co;'}
]

describe('/client', () => {
  const base = '/client'
  describe('/', () => {
    const url = `${base}/register`
    describe('GET', () => {
      it('Should return a file', () => {
        return chai.request(server)
          .get(url)
          .then(res => res.status.should.equal(200))
      })
    })
    describe('POST', () => {
      clientTypes.forEach(client => {
        it(`${client.type} client should${client.valid ? '' : ' not'} return a client ID and client secret pair`, () => {
          return chai.request(server)
            .post(url)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
              redirect_uri: client.redirect_uri,
              grant: client.grants,
            })
            .then(res => {
              res.status.should.equal(200)
              if(client.valid) {
                res.body.should.have.property('clientId').to.match(/[ -~]{10}/)
                res.body.should.have.property('clientSecret').to.match(/[ -~]{40}/)
              } else {
                res.body.should.not.have.property('clientId').to.match(/[ -~]{10}/)
                res.body.should.not.have.property('clientSecret').to.match(/[ -~]{40}/)
              }
            })
        })
      })
    })
  })
})

describe('/user', () => {
  const base = '/user'
  describe('/', () => {
    const url = `${base}/register`
    describe('GET', () => {
      it('Should return a file', () => {
        return chai.request(server)
          .get(url)
          .then(res => res.status.should.equal(200))
      })
    })
    describe('POST', () => {
      userTypes.forEach(user => {
        it(`registration of a ${user.type} user should${user.valid ? '' : ' not'} return a successfull registration message`, () => {
          return chai.request(server)
            .post(url)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
              name: user.name,
              username: user.username,
              password: user.password,
              confirm: user.confirm,
            })
            .then(res => {
              res.status.should.equal(200)
              if(user.valid) {
                res.text.should.equal('User registered')
              } else {
                res.text.should.not.include('User registered')
              }
            })
        })
      })
    })
  })
})

describe('/oauth', () => {
  const base = '/oauth'
  describe('/', () => {
    const url = `${base}/authorize`
    describe('GET', () => {
      it('Should return a file', () => {
        return chai.request(server)
          .get(url)
          .then(res => res.status.should.equal(200))
      })
    })
    describe('POST', () => {
      userTypes.forEach(user => {
        it(`${user.type} user should${user.valid ? '' : ' not'} send a redirect to the proper location`, () => {
          return chai.request(server)
            .post(url)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
              client_id: 'test_client_id',
              response_type: 'code',
              redirect_uri: 'http://localhost/client/register', //Using a URI that will respond with 200
              state: 'test_state',
              username: user.username,
              password: user.password,
            })
            .then(res => {
              res.status.should.equal(200)
              res.redirects.should.be.an('array')
              res.redirects.length.should.equal(1)
              const newLocation = res.redirects[0]

              if(user.valid) {
                const beginning = 'http://localhost/client/register?code='
                newLocation.should.include(beginning)
                const expectedState = 'state=test_state'
                newLocation.should.include(expectedState)
                validData.code = newLocation.replace(beginning, '').substring(0,40)
                validData.code.should.not.equal('')
              } else {
                newLocation.should.include('/oauth/authorize')
                newLocation.should.satisfy(function(res){
                  if (newLocation.includes('user=false') || newLocation.includes('success=false')) return true
                  else return false
                })
              }
            })
        })
      })
    })
  })

  describe('/token', () => {
    const url = `${base}/token`
    describe('POST => authorization_code', () => {
      it('Should return an object with a valid token', () => {
        return chai.request(server)
          .post(url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({
            client_id: 'test_client_id',
            client_secret: 'test_client_secret',
            redirect_uri: 'http://localhost/client/register',
            grant_type: 'authorization_code',
            code: validData.code,
          })
          .then(res => {
            validData.tokenFrom.code = `${res.body.token_type} ${res.body.access_token}`
            validData.refreshToken = res.body.refresh_token
            res.should.have.status(200)
            res.body.should.have.own.property('expires_in')
            res.body.should.have.own.property('access_token')
            res.body.should.have.own.property('token_type')
            res.body.should.have.own.property('refresh_token')
            res.body.access_token.should.not.be.null
            res.body.token_type.should.equal('Bearer')
          })
      })
    })

    describe('POST => refresh_token', () => {
      it('Should return an object with a valid token', () => {
        return chai.request(server)
          .post(url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({
            client_id: 'test_client_id',
            client_secret: 'test_client_secret',
            grant_type: 'refresh_token',
            refresh_token: validData.refreshToken,
          })
          .then(res => {
            validData.tokenFrom.refresh = `${res.body.token_type} ${res.body.access_token}`
            validData.refreshToken = res.body.refresh_token
            res.should.have.status(200)
            res.body.should.have.own.property('expires_in')
            res.body.should.have.own.property('access_token')
            res.body.should.have.own.property('token_type')
            res.body.should.have.own.property('refresh_token')
            res.body.access_token.should.not.be.null
            res.body.token_type.should.equal('Bearer')
          })
      })
    })

    describe('POST => refresh_token => refresh_token', () => {
      it('Should return an object with a valid token', () => {
        return chai.request(server)
          .post(url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({
            client_id: 'test_client_id',
            client_secret: 'test_client_secret',
            grant_type: 'refresh_token',
            refresh_token: validData.refreshToken,
          })
          .then(res => {
            validData.tokenFrom.refreshedRefresh = `${res.body.token_type} ${res.body.access_token}`
            res.should.have.status(200)
            res.body.should.have.own.property('expires_in')
            res.body.should.have.own.property('access_token')
            res.body.should.have.own.property('token_type')
            res.body.should.have.own.property('refresh_token')
            res.body.access_token.should.not.be.null
            res.body.token_type.should.equal('Bearer')
          })
      })
    })
  })
})

describe('/secure Routes', () => {
  const base = '/secure'
  describe('GET', () => {
    it('Returns valid response with a token (Authorization Code)', () => {
      return chai.request(server)
        .get(base)
        .set('Authorization', 'bearer' + validData.tokenFrom.code)
        .then(res => {
          res.should.have.status(200)
        })
    })

    it('Returns valid response with a token (Refresh Token)', () => {
      return chai.request(server)
        .get(base)
        .set('Authorization', validData.tokenFrom.refresh)
        .then(res => {
          res.should.have.status(200)
        })
    })

    it('Returns valid response with a token (Refreshed Refresh Token)', () => {
      return chai.request(server)
        .get(base)
        .set('Authorization', validData.tokenFrom.refreshedRefresh)
        .then(res => {
          res.should.have.status(200)
        })
    })

    it('Returns an invalid response with a bad token', () => {
      return chai.request(server)
        .get(base)
        .set('Authorization', '')
        .then(res => {
          res.should.have.status(401) // Unauthorized
        })
    })
  })
})
