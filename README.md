# PassportJS Strategy for OpenID Connect

This is AFAIK the only passport strategy that relies on the certified OpenID Connect library for Node.js.


## How to use

Install the module

```
npm install passport-openid-connect --save
```

Declare

```
var OICStrategy = require('passport-openid-connect').Strategy
var User = require('passport-openid-connect').User
```

Create a OIC Strategy instance:

```
var oic = new OICStrategy({
  "issuerHost": "https://auth.dataporten.no/",
  "client_id": "dce8045a-25e2-4a39-a245-a7688b5b3cba",
  "client_secret": "eaa3d8c3-517a-4a58-b559-85dacae5fc66",
  "redirect_uri": "http://127.0.0.1:8080/callback",
  "scope": "groups longterm openid userid email profile userid-feide"
});
```


Issuer host is the one that will be used for OpenID Discovery.

Setup generic passport, and make use of the user serialization class if you want (optional):

```
passport.use(oic)
passport.serializeUser(OICStrategy.serializeUser)
passport.deserializeUser(OICStrategy.deserializeUser)

app.use(passport.initialize());
app.use(passport.session());
```

Setup some endpoints:

```
app.get('/', (req, res) => {
	res.json({
		"hello": "world",
		"user": req.user
	})
})
app.get('/login', passport.authenticate('passport-openid-connect', {"successReturnToOrRedirect": "/"}))
app.get('/callback', passport.authenticate('passport-openid-connect', {"callback": true, "successReturnToOrRedirect": "/"}))
```
