const faunadb = require('faunadb')
const insideNetlify = insideNetlifyBuildContext()
const q = faunadb.query

console.log('Creating database...')

if (!process.env.FAUNADB_SERVER_SECRET) {
  console.log('No FAUNADB_SERVER_SECRET found')
  if (insideNetlify) {
    process.exit(1)
  }
}

if (process.env.FAUNADB_SERVER_SECRET) {
  createFaunaDB(process.env.FAUNADB_SERVER_SECRET).then(() => {
    console.log('Database has been created')
  })
}

function createFaunaDB(key) {
  console.log('Create database')
  const client = new faunadb.Client({
    secret: key
  })

  return client.query(q.Create(q.Ref('classes'), { name: 'todos' }))
    .then(() => {
      return client.query(
        q.Create(q.Ref('indexes'), {
          name: 'all_todos',
          source: q.Ref('classes/todos')
        }))
    }).catch((e) => {
      if (e.requestResult.statusCode === 400) {
        console.log('Good to go')
        throw e
      }
    })
}

function insideNetlifyBuildContext() {
  if (process.env.DEPLOY_PRIME_URL) {
    return true
  }
  return false
}
