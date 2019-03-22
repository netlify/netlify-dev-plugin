module.exports = {
  name: 'fauna-crud',
  description: 'CRUD function using Fauna DB',
  addons: ['fauna'], // in future we'll want to pass/prompt args to addons
  onComplete() {
    console.log(`fauna-crud function created from template!`)
  }
}
