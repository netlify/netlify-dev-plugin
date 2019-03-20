## note to devs

place new templates here and our CLI will pick it up. each template must be in its own folder.

## why place it in this separate folder

we dont colocate this inside `src/commands/functions` because oclif will think it's a new command.

every function should be registered with their respective `template-registry.js`.
