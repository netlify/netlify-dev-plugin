# CONTRIBUTING

Contributions are always welcome, no matter how large or small. Before contributing,
please read the [code of conduct](CODE_OF_CONDUCT.md).

## Setup

Install Node.js 8+ on your system: https://nodejs.org/en/download/

1. Clone down the repo

```sh-session
$ git clone https://github.com/netlify/netlify-dev-plugin.git
```

2. Install dependencies

```sh-session
$ npm install
```

3. Run CLI locally during development

```sh-session
$ ./bin/run [command]
```

When developing, you can use watch mode which will automatically run ava tests:

```sh-session
$ npm run watch
```

## Architecture

Netlify Dev Plugin is written using the [oclif](https://oclif.io/) cli framework and the [netlify/js-client](https://github.com/netlify/js-client) open-api derived API client.

- Commands live in the [`src/commands`](src/commands) folder.
- The base command class which provides consistent config loading and an API client lives in [`src/base`](src/base).
- Small utilities and other functionality live in [`src/utils`](src/utils).

A good place to start is reading the base command README and looking at the commands folder.

### Testing

This repo uses [Mocha](https://mochajs.org/) for testing. Any files in the 
`src` directory that have a `.test.js` file extension are automatically 
detected and run as tests.

We also test for a few other things:

- Dependencies (used an unused)
- Linting
- Test coverage
- Must work with Windows + Unix environments.

## Pull Requests

We actively welcome your pull requests.

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.

## Releasing

1. `npm version [major, minor, patch]`  Generate changelog and bump version.
2. `npm publish` Publish to npm, push version commit + tag, push latest CHANGELOG entry to GitHub release page.

## License

By contributing to Netlify Dev Plugin, you agree that your contributions will be licensed
under its [MIT license](LICENSE).
