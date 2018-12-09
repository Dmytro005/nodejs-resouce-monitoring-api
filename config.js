/**
 * 
 * Configurational variables
 * 
 * 
 */

 // Container for all the environments
 const environments = {}

 environments.dev = {
     'port': 3000,
     'envName': 'dev',
 }
 
 environments.production = {
     'port': 5000,
     'envName': 'production',
 }
 
 const currentEnv = typeof(process.env.NODE_ENV) == 'string' ?
    process.env.NODE_ENV.toLowerCase() : 'dev'
 
 const environmentToExport = typeof(environments[currentEnv] == 'object') ? 
    environments[currentEnv] : environments.dev

module.exports = environmentToExport;
