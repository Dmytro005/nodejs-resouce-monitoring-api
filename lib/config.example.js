/**
 *
 * Configurational variables
 *
 *
 */

// Container for all the environments
const environments = {};

environments.dev = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: "dev",
    hashSecret: "",
    maxChecks: 5,
    twilio: {
        accountSId: "",
        authToken: "",
        fromPhone: ""
    },
    templateGlobals: {
        appName: "",
        companyName: "",
        yearCreated: "",
        baseUrl: ""
    }
};

environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: "production",
    hashSecret: "",
    maxChecks: 5,
    twilio: {
        accountSId: "",
        authToken: "",
        fromPhone: ""
    },
    templateGlobals: {
        appName: "",
        companyName: "",
        yearCreated: "",
        baseUrl: ""
    }
};

const currentEnv =
    typeof process.env.NODE_ENV == "string"
        ? process.env.NODE_ENV.toLowerCase()
        : "dev";

const environmentToExport = typeof (environments[currentEnv] == "object")
    ? environments[currentEnv]
    : environments.dev;

module.exports = environmentToExport;
