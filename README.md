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

## Functionality Notes

- `netlify dev` now supports both `_redirects` and `netlify.toml` for redirects and has the same logic around loading order as our system (\_redirects, toml in public folder, toml in base)
- `netlify dev` can be configured for projects we don’t detect out of the box with a `[dev]` block in the toml file

## `netlify functions:create`

Create a new function from a given template.

Examples:

```
netlify functions:create
netlify functions:create hello-world
netlify functions:create --name hello-world
netlify functions:create hello-world --dir
netlify functions:create --url https://github.com/netlify-labs/all-the-functions/tree/master/functions/9-using-middleware
```

You can just call `netlify functions:create` and the prompts will guide you all the way, however you can also supply a first argument to name the function. By default it creates a single file, however you can also use a `--dir` flag to create a function as a directory.

By passing a folder in a github repo to the `--url` flag, you can clone new templates. Dependencies are installed inside its own folder.
