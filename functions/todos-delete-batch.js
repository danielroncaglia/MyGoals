const faunadb = require('faunadb')
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})
exports.handler = async (event, context) => {
  const data = JSON.parse(event.body)
  console.log('data', data)
  console.log('Function delete-batch', data.ids)
  const deleteAllCompletedTodoQuery = data.ids.map((id) => {
    return q.Delete(q.Ref(`classes/todos/${id}`))
  })
  return client.query(deleteAllCompletedTodoQuery)
    .then((response) => {
      console.log('good', response)
      return {
        statusCode: 200,
        body: JSON.stringify(response)
      }
    }).catch((error) => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}