import fetch, { Headers, Request } from '/opt/nodejs/node_modules/node-fetch/src/index.js';
import { MongoClient } from "/opt/nodejs/node_modules/mongodb/lib/aws.js";
const URI = process.env['VS_MONGO_URI'];

let cachedDb = null;
async function connectToDatabase(dbName) {
    if (cachedDb && cachedDb.name === dbName) {
        return cachedDb.db;
    }
    const client = await MongoClient.connect(URI);
    let db = await client.db(dbName);
    cachedDb = {};
    cachedDb.name = dbName;
    cachedDb.db = db;
    return db;
}

exports.DAL = async(event, context) => {
    const routeKey = event["routeKey"];
    const VS_auth_code = event["vs-auth-code"];
    const VS_redirect_uri = event["vs-redirect-uri"];

    context.callbackWaitsForEmptyEventLoop = false;

    console.log(`DAL:: Switching ${routeKey} `);
    let data;
    switch (routeKey) {
        case 'GET /invoice-module':
            db = await connectToDatabase("scraper-modules");
            console.log("DAL:: Successfully connected to mongoDB-scraper-modules!");
            data = await db.collection('invoice-module').findOne();
            console.log("DAL:: Successfully retreived 'invoice-module' collection!");
            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };

        case 'GET /table-module':
            db = await connectToDatabase("scraper-modules");
            console.log("DAL:: Successfully connected to mongoDB-scraper-modules!");
            data = await db.collection('table-module').findOne();
            console.log("DAL:: Successfully retreived 'table-module' collection!");
            return {
                statusCode: 200,
                body: JSON.stringify(data)
            };

        case 'POST /verify-auth-code':
            db = await connectToDatabase("vinnyscrape-users").catch(err => console.error(err));
            console.log("DAL:: Successfully connected to vinnyscrape-users.Users collection!");
            if (VS_auth_code) {
                // check if the code belongs to a user in mongodb/vinnyscrape-users/Users collection
                console.log(`DAL:: Code recieved: ${VS_auth_code}`);
                let userData = await db.collection('Users').findOne({ code: VS_auth_code });
                if (userData === null) {
                    // console.log(`DAL:: Inserting code to a new document in Users collection`);
                    // await db.collection('Users').insertOne({ code: VS_auth_code });
                    handleCodeTokenExchange();
                }
                console.log(userData);
                return {
                    statusCode: 200,
                    body: JSON.stringify(userData)
                }
            }
            break;
    }

    return {
        statusCode: 400,
        body: "DAL:: Bad Request!",
    };


    async function handleCodeTokenExchange(auth_code, redirect_uri) {
        console.log(`USERS:: Exchanging token for auth_code: ${auth_code} with uri: ${redirect_uri}`);
        if (auth_code && redirect_uri) {
            // call https://COGNITO_DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/token
            const OAuthURL = `${outputs.VS_Cognito_userpool_domain_full.value}/oauth2/token?`;
            const client_id = outputs.VS_Cognito_userpool_client_id.value;
            const secret = outputs.VS_Cognito_userpool_client_secret.value;
            const encodedShit = Buffer.from(`${client_id}:${secret}`).toString('base64');
            const uri = redirect_uri.endsWith('/') ? redirect_uri.substring(0, redirect_uri.length - 1) : redirect_uri;

            const headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded');
            headers.set('Authorization', `Basic ${encodedShit}`); // add base64encoded shit here

            const params = new URLSearchParams();
            params.set('grant_type', 'authorization_code');
            params.set('client_id', client_id); // add shit here
            params.set('code', auth_code); // add shit here
            params.set('redirect_uri', uri); // NO TRAILING '/' !!! :D dipshits

            console.log(`USERS:: Calling exchange endpoint with:\n${OAuthURL.concat(params)}`);
            const request = new Request(OAuthURL.concat(params), {
                method: 'POST',
                headers: headers,
                mode: 'cors'
            });

            // i will put this token on mongoDB eventually, right now im not keeping tokens, just making sure it works first
            let res = await fetch(request);

            const goodreq = /(\b2\d\d\b)/g;
            const badreq = /(\b4\d\d\b)/g;
            if (res.status.toString().match(goodreq)) {
                console.log("USERS:: Verified user - exchanging auth code for token...");
                res = await res.json();
                console.log("FETCH:: Response json: ", res);
                return {
                    statusCode: 200,
                    body: "USERS:: Verified user - exchanging auth code for token..."
                }
            } else if (res.status.toString().match(badreq)) {
                console.log("USERS:: Bad request! Unverified user!");
                return {
                    statusCode: 400,
                    body: "USERS:: Bad request! Unverified user or just a bad request!"
                }
            }
        }
    }

};

// TESTS
// module.exports.DAL({ routeKey: "GET /invoice-module" }, {});
// module.exports.DAL({ routeKey: "POST /verify-auth-code", headers: { 'vs-auth-code': '6a819ed6-7f1b-4b14-8053-86940d1370eb' } })