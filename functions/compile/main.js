const babel = require('@babel/core')

exports.handler = async function (event, context) {
  babel.transformSync('code', optionsObject)
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  }
}
