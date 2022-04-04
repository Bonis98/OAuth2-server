# OAuth2-server
Example of an Oauth 2.0 server written in Nodejs. The server is based on Oauth2-server (https://www.npmjs.com/package/oauth2-server) and express-oauth-server
(https://www.npmjs.com/package/express-oauth-server) and supports authorization_code grant and refresh_token grant.

<a id='install'></a>
# Installation and Setup

1. Clone this Repo
1. `cd` into the project root folder, and run `npm install`
    - If `npm` is not installed, install it and then run `npm install`
1. Run `npm start` to boot up the Oauth 2.0 Server
1. Run `npm test` to run unit tests that cover all implemented grants
    - For verbose output, modify `level` in `tests/setup.js` to be `DebugControl.levels.ALL`

[back](#top)

<a id='database'></a>
# Database

The Oauth 2.0 Server require a MongoDB connection. The DB structure can be seen in `utilities/DB`.
In order to provide the connection string, you have to create a file called `config.json` with this structure
```json
{
  "connectString":"string provided by MongoDB"
}
```

[back](#top)

<a id='ssl'></a>
# SSL support

By default the Oauth 2.0 Server redirects all the connections to the HTTPS server. In order to get it to work you have to create a folder named `cert` and put inside the `server.cert` and `server.key` files.
You can generate them using the command:
```shell
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

[back](#top)

<a id='test'></a>
# Test

In order to run a test you have to remove the HTTPS support by commenting out these lines in the `app.js` file:
```js
app.all('*', function(req, res, next){
  if (req.secure) return next()
  res.redirect(307, 'https://' + req.hostname + req.url)
})
```
```js
https.createServer({
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert'),
}, app).listen(port)
```
You also have to insert this object in the document `clients` in MongoDB:
```json
{
"clientId": "test_client_id",
"clientSecret":"test_client_secret",
"grants":["authorization_code","refresh_token"],
"redirectUris":["http://localhost/client/register"],
"__v": 0
}
```
Running a test will create a test user (username: username, password:password, name:exmaple). If a test is runned twice, user creation will return an error (due to duplicate user), you have to delete from MongoDB the test user before re-run it.

[back](#top)

<a id='url'></a>
# URL Queries and Formatting

Once everything is set up the Server is able to handle these requests:

1. Client registration
1. User registration
3. Get Authorization Code
4. Get Token
5. Get Access to Protected Resource

This section will outline how each of these requests ought to be formatted to successfully go through.

[back](#top)

<a id='url-client'></a>
### Client registration

The request to register a client is one of the simplest requiring a GET on the URL `/client/register`. The Server will send back a form to compile with the redirect URI and the grant types.
Grant types must be specified as a set of semicolon separated values, as an example: `authorization_code;refresh_token;` is a valid string.
The server will validate the form and send back a `client_id` and a `client_secret`.

[back](#top)

<a id='url-user'></a>
### User registration

The request to register a user is one of the simplest requiring a GET on the URL `/user/register`. The Server will send back a form to compile with the username, password and name of the user.
The server will validate the form and send back a success or error message.

[back](#top)

<a id='url-code'></a>
### Authorization Code

The request for an authorization code can be made using a GET on the url `/oauth/authorize`. It requires the following information:

- client_id // The unique string identifying a client
- redirect_uri // The place to redirect after receiving the code
- response_type // what the client is expecting. Should be `code`
- state // Provided by the client to prevent CSRF

These parameters can be included within the body of a POST request, or be sent as URL Query Parameters like this: `/oauth/authorize?client_id=<ID>&redirect_uri=<URL>&response_type=code&state=<STATE>`

The server will respond with an error or a redirect to the redirect_uri.

[back](#top)

<a id='url-token'></a>
### Token

The request for an access token can be made using a POST on the url `/oauth/token`. It requires the following information:

- client_id // Unique string of client
- client_secret // client secret key
- grant_type // authorization_code in this example
- code //the authorization code of prevoius step
- redirect_uri //redirect uri provided in the previous step 

The request should additionally have the following header:

`'Content-Type': 'application/x-www-form-urlencoded'`

and the data must be provided within the body of a post request.

The server will respond with an access token and a refresh token.

[back](#top)

<a id='url-resource'></a>
### Access Protected Resource

An example of access to protected reosurce can be simulated using a GET on the URL `/secure` with a special header included:

```js
{
  Authorization: `${tokenType} ${token}`,
}
```

The s erver will respond with a positive messagge in case of a correct request.

[back](#top)
