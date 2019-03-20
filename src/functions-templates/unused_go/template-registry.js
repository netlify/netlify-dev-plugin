// every object should have:
// //  a 'name' field that corresponds to a folder
// // "description" is just what shows in the CLI but we use the name as the identifier
// onComplete is optional.
// priority is optional - for controlling what shows first in CLI
module.exports = [
  {
    name: 'hello-world',
    priority: 1,
    description: 'Basic Hello World function in Golang'
  }
]
