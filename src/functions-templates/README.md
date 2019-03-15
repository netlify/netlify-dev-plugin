## note to devs

place new templates here and our CLI will pick it up. currently only works for single file `.js` templates.

## why place it in this separate folder

we dont colocate this inside `src/commands/functions` because oclif will think it's a new command.

## providing metadata (and other functionality)

we split the file based on the `// --- Netlify Template Below -- //` string. everything below it is cloned as the template. everything above it can be required and run as a module for configuring the template. for now we simply export a `metadata` object that fits [`inquirer's choices spec`](https://www.npmjs.com/package/inquirer#question). 

once the templating is done we can also call an `onComplete` hook to print a reminder or execute other logic - see `node-fetch.js` for an example.

in future we can think about other options we may want to offer.

## future dev thoughts

we will want a way to scale this to TS and Go as well.
