## writing a detector

- write as many checks as possible to fit your project
- return false if its not your project
- if it definitely is, return an object with this shape:

```ts
{
    type: String, // e.g. gatsby, vue-cli
    command: String, // e.g. yarn, npm
    port: Number, // e.g. 8888
    proxyPort: Number, // e.g. 3000
    env: Object, // env variables, see examples
    possibleArgsArrs: [[String]], // e.g [['run develop]], so that the combined command is 'npm run develop', but we allow for multiple
    urlRegexp: RegExp, // see examples
    dist: String, // e.g. 'dist' or 'build'
}
```

## things to note

- Dev block overrides will supercede anything you write in your detector: https://github.com/netlify/netlify-dev-plugin#project-detection
- detectors are language agnostic. don't assume npm or yarn.
- if default args (like 'develop') are missing, that means the user has configured it, best to tell them to use the -c flag.
