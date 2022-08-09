const aws = require('aws-sdk');
const lambda = new aws.Lambda({ apiVersion: '2015-03-31' });
exports.HTTPHandler = async(event, context) => {
    // some const values
    const myHeader = event.headers['vinnyscrape-path'];
    const origin = event.headers['origin'];
    const requestFullOrigin = myHeader ? origin + myHeader : origin;
    const routeKey = event["routeKey"];
    console.log(`HTTP Handler:: New Request Incoming!\n${routeKey} from: ${requestFullOrigin}`);

    if (requestFullOrigin) {
        switch (routeKey) {
            // GET
            case 'GET /scrape':
                return await callScraper(requestFullOrigin, "scraper");
            case 'GET /scrape/layered':
                return await callScraper(requestFullOrigin, "scraper-layered");
            case 'POST /validate':
                if (event.body) {
                    return validateForm(JSON.parse(event.body));
                }
                return {
                    statusCode: 400,
                    body: 'HTTPHANDLER:: Request Denied!\n\nInvalid request <body>!\nPlease add a body to the validation request!'
                };

            default:
                return {
                    statusCode: 400,
                    body: `HTTPHANDLER:: Request Denied!\n\nRoute key: ${routeKey} is not a valid route key!`
                };
        }
    }
    return {
        statusCode: 400,
        body: 'HTTPHANDLER:: Request Denied!\n\nThe <origin> is not wellformed!'
    };
};
// ------------------------------------------------------ End of HTTPHandler ---------------------------------------------------------

async function callScraper(url, scraperType) {
    let Scraper = process.env.Scraper; // default scraper
    if (scraperType === 'scraper-layered') {
        Scraper = process.env.ScraperLayered
    }
    const bucketName = process.env.bucketName;
    console.log('Invoking: ' + Scraper + ' for URL: ', url);

    //await Promise.all(urls.map(async(url) => {
    return await lambda.invoke({
            FunctionName: Scraper,
            InvocationType: 'RequestResponse',
            LogType: 'None',
            Payload: JSON.stringify({
                'scrapeUrl': url,
                'bucketName': bucketName
            })
        }).promise()
        .catch(err => {
            console.error(err)
            return {
                statusCode: 400,
                body: `${err}`
            }
        }); // catch ivdividual promise
    // })).catch(err => console.error(err)); // catch Promise.all
}

function validateForm(body) {
    const validForm = {
        "invoiceId": "21341",
        "client": "Arboshiki Inc.",
        "clientAddr": "455 Foggy Heights, AZ 85004, US",
        "clientPhone": "(123) 456-789",
        "clientEmail": "company@arboshiki.com"
    };
    let correct = true;
    // Object.values() returns ar array of the values, 
    const bodyVals = Object.values(body);
    const validVals = Object.values(validForm);
    // if the lengths are the same, we can validate the data
    // iterate over the values and compare them to the similarly-indexed validForm values, if any one of them is incorrect, set <correct: Bool> to false!
    bodyVals.length == validVals.length ? bodyVals.forEach((val, i) => { val !== validVals[i] ? correct = false : null }) : correct = false;
    // if correct -> 200, else -> 400
    if (correct) {
        console.log('SUCCESS! The demo is working properly in the current version!');
        return {
            statusCode: 200,
            body: '\nValidator::  Successfully validated form!'
        };
    } // else
    console.log('FAIL! The data is NOT the same as validFormData!');
    return {
        statusCode: 400,
        body: '\nValidator::  The scraped data does NOT match the expectation!'
    };
};


// TESTS
//  module.exports.HTTPHandler({ headers: { origin: 'http://localhost:3000' }, routeKey: 'GET /invoice-module' });