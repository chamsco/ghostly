module.exports = {
  migrations: [
    'src/migrations/*.ts'
  ], 
  cli: {
    migrationsDir: 'src/migrations'
  }
}