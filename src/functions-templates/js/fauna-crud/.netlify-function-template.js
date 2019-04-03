module.exports = {
  name: 'fauna-crud',
  description: 'CRUD function using Fauna DB',
  addons: [
    {
      addonName: 'fauna',
      addonDidInstall() {
        console.log('process.env', process.env)
        require('./create-schema.js')
      }
    }
  ],
  onComplete() {
    console.log(`fauna-crud function created from template!`)
  }
}
