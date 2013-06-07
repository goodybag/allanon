# New Goodybag Website Stuff

You'll need jam installed globally to install front-end dependencies:

```
npm install -g jamjs
```

Clone the repo and then:

```
jam install
```

## Environment Variables

Copy ```environment.tmpl.js``` to ```environment.js``` and fill in the details.

## Deployment

You need grunt installed globally:

```
npm install -g grunt-cli
```

Install the deployment dependencies:

```
npm install
```

You need to setup an s3 key/secret in your ```environment.js``` file:

```
s3: {
  key: 'MY_S3_KEY'
, secret: 'SUPER_SECRET_SECRET'
}
```

To test your build, simply type:

```
grunt
```

To build and deploy to staging:

```
grunt staging
```

To build and deploy to production:

```
grunt prod
```

To just deploy the build in the specified build directory:

```
grunt s3:staging
-- or
grunt s3:prod
```
