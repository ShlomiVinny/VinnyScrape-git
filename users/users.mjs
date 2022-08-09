import AWS from '/opt/nodejs/node_modules/aws-sdk/lib/aws.js';
import { readFileSync } from 'fs';
const lambda = new AWS.Lambda({ apiVersion: '2015-03-31', region: 'eu-west-2' });
const outputs = JSON.parse(readFileSync('./outputs.json'));
export default async function users(event, context) {
    const routeKey = event["routeKey"];
    const routeKeyArr = routeKey.split(' ');
    const method = routeKeyArr[0];
    const path = routeKeyArr[1];
    const vs_user = event.headers["x-vs-user"];
    const vs_auth_code = event.headers["x-vs-auth-code"];
    const vs_redirect_uri = event.headers["x-vs-redirect-uri"];
    console.log("USERS:: Incoming: ", routeKey, " Switching...");
    switch (routeKey) {
        case 'GET /users':
            if (vs_user)
                return await getUserCredentials(vs_user);
            else {
                console.log("USERS:: Request denied! ", routeKey, " Missing key headers!");
                return { statusCode: 400, body: `USERS:: Bad Request! Missing key headers!` };
            }

        case 'POST /users/verify':
            if (vs_auth_code && vs_redirect_uri) {
                console.log(`USERS:: Verify: ${vs_auth_code} - redirect to: ${vs_redirect_uri}`);
                return await handleVerifyRequest(vs_auth_code, vs_redirect_uri);
                // return await handleCodeTokenExchange(vs_auth_code, vs_redirect_uri);
            } else {
                console.log("USERS:: Request denied! ", routeKey, " Missing key headers!");
                return {
                    statusCode: 400,
                    body: `USERS:: Bad Request! Missing key headers!`
                };
            };

        case 'POST /users/renew':
            return {
                statusCode: 400,
                body: `USERS:: ${method} ${path} not yet implemented!`
            };

        default:
            console.log('USERS:: Incoming: -default triggered- ', routeKey);
            return {
                statusCode: 400,
                body: `USERS:: Bad Request!`
            };
    };
}; // --- ENDOF users ---

async function getUserCredentials(user) {
    // DB up at mongo already, with all the data, i just need to put some code here to get those creds, without exposing my DB to the end-user
    // So i rather do it this way, through a third lambda that will have access to both cognito and mongo for token storage or whatever
    // Cognito can serve as a login/signup and auth service, while user info and data will be stored on mongoDB
    // Damn! i have a lot to do still...
    const users = {
        "s3GetObjectUser": {
            "AWS_ACCESS_KEY_ID": "",
            "AWS_SECRET_ACCESS_KEY": ""
        }
    };

    if (users[user]) {
        console.log(`User: ${user} requested! Sending credentials as base64 hash!`);
        const creds = Buffer.from(`${users[user]["AWS_ACCESS_KEY_ID"]}:${users[user]["AWS_SECRET_ACCESS_KEY"]}`).toString('base64');
        return {
            statusCode: 200,
            body: creds
        }
    }
    console.log(`Users:: Bad Request! No User: ${user} was found!`);
    return {
        statusCode: 400,
        body: `Bad Request! No User: ${user} was found!`
    }
}

async function handleVerifyRequest(code, redirect_uri) {
    // invoke DAL
    const DAL = outputs.DAL_function_name.value;
    console.log(`USERS:: Invoking: ${DAL} with: ${code} - ${redirect_uri}`);
    return await lambda.invoke({
            FunctionName: DAL,
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: JSON.stringify({
                routeKey: 'POST /verify-auth-code',
                'vs-auth-code': code,
                'vs-redirect-uri': redirect_uri

            })
        }).promise()
        .catch(err => {
            console.error(err)
            return {
                statusCode: 400,
                body: `${err}`
            }
        }); // catch ivdividual promise
    // if it is check if it has expired, if not return "verfied user message"
    // if no document has that code, user is not yet verified -> handleCodeTokenExchange()
    // if response from exchange is OK, insert a new document with the auth code and tokens
}


//response should be: {
//   "access_token":"xxxxxxxxxxxxxxxxxxx", 
//   "refresh_token":"xxxxxxxxxxxxxxxx",
//   "id_token":"xxxxxxxxxxxxxxxxx",
//   "token_type":"Bearer", 
//   "expires_in":xxxx <number>
// }


// users({ routeKey: "POST /users/verify", headers: { "x-vs-user": "s3GetObjectUser", "x-vs-auth-code": "6a819ed6-7f1b-4b14-8053-86940d1370eb", "x-vs-redirect-uri": "https://d8ev7ren9xjon.cloudfront.net" } }, {});
// users({ routeKey: 'GET /invoice-module', headers: {} });