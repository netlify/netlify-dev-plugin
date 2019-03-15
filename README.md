# netlify-dev-plugin

Netlify CLI plugin for local dev experience.

## Usage

- `netlify dev` start a local dev server for the build tool you're using
- `netlify dev:exec <command>` runs a shell command within the netlify dev environment
- `netlify functions:create` bootstrap a new function

## Using the beta

Currently the Netlify dev plugin is in private beta. You'll need to follow these steps to enable it:

Make sure Netlify CLI is installed and up to date:

```
npm install -g netlify-cli
```

Then clone and activate the plugin:

```
git clone git@github.com:netlify/netlify-dev-plugin.git
cd netlify-dev-plugin
npm install
netlify plugins:link .
```

Now you're both ready to start testing netlify dev and to contribute to the project.

## Functionality

- `netlify dev` now supports both `_redirects` and `netlify.toml` for redirects and has the same logic around loading order as our system (_redirects, toml in public folder, toml in base)
-  `netlify dev` can be configured for projects we don’t detect out of the box with a `[dev]` block in the toml file
