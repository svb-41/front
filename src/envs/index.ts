export const URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3333'
    : 'https://m01wke3al4.execute-api.eu-west-3.amazonaws.com'

const dev = {
  clientId: 'Dkdvcp6GE7NpgjNvuXVxXkplh73iufVR',
  domain: 'svb-41-dev.eu.auth0.com',
  // audience: 'https://api.svb-41.com',
}

const prod = {
  clientId: 'pExP09UEbn2yneoyh0woGnWHnrxtbGSy',
  domain: 'svb-41.eu.auth0.com',
  // audience: 'https://api.svb-41.com',
}

export default process.env.NODE_ENV === 'development' ? dev : prod
