    This file will NOT run locally, this code will ONLY work in a lambda environment

* I will figure out a way to run this locally, there is one, i know there is, just not rn 

Right now there is some bug with terraform and AWS lambda layers; When i create a layer through TF with the 'mongodb' package, it seems to break and throws an error.
Meanwhile if i upload the zip created by the archive_file resource to a layer created manually through the AWS console, it works fine.
So for the mean time i would leave it as is, since it works, i will figure it our later...

*Error:*

    {
        "errorType": "TypeError",
        "errorMessage": "Cannot read properties of undefined (reading 'constructor')",
        "stack": [
            "TypeError: Cannot read properties of undefined (reading 'constructor')",
            "    at new ConnectionString (/opt/nodejs/node_modules/mongodb-connection-string-url/lib/index.js:152:98)",
            "    at parseOptions (/opt/nodejs/node_modules/mongodb/lib/connection_string.js:209:17)",
            "    at new MongoClient (/opt/nodejs/node_modules/mongodb/lib/mongo_client.js:64:63)",
            "    at Runtime.exports.Scraper [as handler] (/var/task/Scraper-layered.js:16:21)",
            "    at Runtime.handleOnce (file:///var/runtime/index.mjs:548:29)"
        ]
    }

I have no solution currently, only a workaround.
