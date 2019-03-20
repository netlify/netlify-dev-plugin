## note to devs

place new templates here and our CLI will pick it up. each template must be in its own folder.

## why place templates in a separate folder

we dont colocate this inside `src/commands/functions` because oclif will think it's a new command.

every function should be registered with their respective `template-registry.js`.

## typescript and go

we have some templates here but they are unused for now until Netlify Dev supports them.
