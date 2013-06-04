# New Goodybag Website Stuff

You'll need jam installed globally to install front-end dependencies:

```
npm install -g jamjs
```

Clone the repo and then:

```
jam install
```

## Deployment

You need grunt installed globally:

```
npm install -g grunt-cli
```

Install the deployment dependencies:

```
npm install
```

You need to setup an s3 key/secret in your environment:

```
export GB_WEBSITE_S3_KEY=aslkdjflkasjdfjlaksdjf
export GB_WEBSITE_S3_SECRET=asdjfhalsdfhadfflkjasdlkfj
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
