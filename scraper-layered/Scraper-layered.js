const aws = require('aws-sdk');
const { MongoClient, ServerApiVersion } = require('mongodb');
const outputs = require('./outputs.json');
const chromium = require('@sparticuz/chrome-aws-lambda');
exports.Scraper = async(event, context) => {
    // --------------------------------------------------> setup <---------------------------------------------------
    let global_Data;
    let global_DataSet;
    let global_DataSetName = '';
    let global_ScrapeDocType = '';

    const awsRequestId = context['awsRequestId'];
    const bucketName = event['bucketName'];
    const url = event['scrapeUrl'].split('?');
    const requestOrigin = url[0];
    const searchParams = new URLSearchParams(url[1]);
    const mongodburi = "mongodb+srv://vinnyscrape:Zbg4dpwbtJvX3l6H@vinnyscrapecluster.kjnaczt.mongodb.net/?retryWrites=true&w=majority";
    const MClient = new MongoClient(mongodburi, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    // **************************** CONNECT TO MONGO! *************************************
    await MClient.connect();
    // **************************** CONNECT TO MONGO! *************************************

    let defaultViewport = chromium.defaultViewport;
    defaultViewport.height = 800;
    defaultViewport.width = 800;
    const launchArgs = {
        ignoreHTTPSErrors: true,
        headless: chromium.headless,
        defaultViewport: defaultViewport,
        executablePath: await chromium.executablePath,
        args: chromium.args
    };
    // -----------------------------------------------> END setup <-------------------------------------------------

    // --- Its all a bunch of methods/functions below ---

    async function getDataSet(DataSetName) {
        const collection = MClient.db("scraper-modules").collection(DataSetName);
        let DataSet = await collection.findOne().catch(err => console.error(err));
        console.log('SCRAPER:: DataSet retreived from mongoDB');
        return DataSet;
    }

    async function updateDocument(DataSet_id, updatedDataSet, DataSetName) {
        const collection = MClient.db('scraper-modules').collection(DataSetName);
        await collection.updateOne({ _id: DataSet_id }, { $set: updatedDataSet }).catch(err => console.error(err));
        console.log('SCRAPER:: Successfully updated mongoDB with new data set!');
    }

    async function determineScrapeTypeAndDataSet() {
        if (searchParams.has('checkbox') && (requestOrigin.endsWith('tables') || requestOrigin.endsWith('Tables'))) {
            global_ScrapeDocType = 'tablecheck';
            global_DataSetName = 'table-module';
            global_DataSet = await getDataSet(global_DataSetName);
            console.log("SCRAPER:: Doc type is: tablecheck ");
        } else if (requestOrigin.endsWith('invoices') || requestOrigin.endsWith('Invoices')) {
            global_ScrapeDocType = 'invoice';
            global_DataSetName = 'invoice-module';
            global_DataSet = await getDataSet(global_DataSetName);
            console.log("SCRAPER:: Doc type is: invoice ");
        } else if (requestOrigin.endsWith('tables') || requestOrigin.endsWith('Tables')) {
            global_ScrapeDocType = 'table';
            global_DataSetName = 'table-module';
            global_DataSet = await getDataSet(global_DataSetName);
            console.log("SCRAPER:: Doc type is: table ");
        } else {
            console.log("SCRAPER:: Doc type cannot be determined! Stopping scraper! ");
        }
    }

    async function scrapeData(page) {
        let data = {};
        if (global_ScrapeDocType === 'table') {
            await page.$$eval(global_DataSet.selectors.table1.searchFor, el => el.map(ele => ele.innerText))
                .then(JSHArr => {
                    data.table1 = JSHArr;
                    global_DataSet.selectors.table1.timesScraped += JSHArr.length;
                })
                .catch(err => console.error(err));
        } else if (global_ScrapeDocType === 'tablecheck') {
            await page.$$eval(global_DataSet.selectors.tablecheck1.searchFor, el => el.map(ele => ele.innerText))
                .then(JSHArr => {
                    data.table1 = JSHArr;
                    global_DataSet.selectors.tablecheck1.timesScraped += JSHArr.length;
                })
                .catch(err => console.error(err));
        } else if (global_ScrapeDocType === 'invoice') {
            for (const selector in global_DataSet.selectors) {
                await page.$$eval(global_DataSet.selectors[selector].searchFor, el => el.map(ele => ele.textContent))
                    .then(JSHArr => {
                        data[selector] = JSHArr[0];
                        global_DataSet.selectors[selector].timesScraped++;
                    })
                    .catch(err => console.error(err));
            };
        }
        console.log('SCRAPER:: Done scraping data! Updating mongoDB and Processing data for fill-up...');
        await updateDocument(global_DataSet._id, global_DataSet, global_DataSetName).catch(err => console.error(err));
        return data;
    };

    function processData(data) {
        if (global_ScrapeDocType === 'table' || global_ScrapeDocType === 'tablecheck') {
            let tempData = [];
            for (const line of data.table1) {
                let lineArr = line.split('\n');
                tempData.push({
                    Invoice: `${lineArr[1]}`,
                    Status: `${lineArr[lineArr.length-1]}`
                })
            }
            return tempData;
        } else if (global_ScrapeDocType === 'invoice') {
            // for example the invoiceId comes with the word 'Invoice ', but we need it to have digits only
            data.invoiceId.trimStart();
            if (data.invoiceId.startsWith("Invoice ")) {
                data.invoiceId = data.invoiceId.replace("Invoice ", "");
            };
        }
        console.log('SCRAPER:: Done processing data!');
        return data;
    };

    async function getTableInputsLength(page) {
        return await page.$$eval(global_DataSet.selectors.table1.fillIn, el => el.length)
            .catch(err => console.error(err));
    }

    async function addField(page) {
        return await page.$$eval(global_DataSet.selectors.table1.addField, el => el.map(ele => { if (ele.value.includes('Add')) return ele.click(); }))
            .catch(err => console.error(err));
    }

    async function createInputs(page) {
        let len = await getTableInputsLength(page);
        while (len < global_Data.length) {
            await addField(page);
            len = await getTableInputsLength(page);
        }
        console.log(`FILLER:: Created ${len} inputs!`);
    }

    async function fillUpForm(page) {
        if (global_ScrapeDocType === 'table') {
            let len = await getTableInputsLength(page);
            if (len < global_Data.length) {
                await createInputs(page);
            }
            // fill up
            let count = 1;
            for (const data of global_Data) {
                let tag1 = `${global_DataSet.selectors.table1.fillInvoice}${count}`;
                let tag2 = `${global_DataSet.selectors.table1.fillStatus}${count}`;
                let datum1 = data.Invoice;
                let datum2 = data.Status;

                await page.$(tag1).then(async el => await el.type(datum1).catch(rej => { throw rej })).catch(rej => { throw rej });
                await page.$(tag2).then(async el => await el.type(datum2).catch(rej => { throw rej })).catch(rej => { throw rej });
                count++;
            };
        } else if (global_ScrapeDocType === 'tablecheck') {
            let len = await getTableInputsLength(page);
            if (len < global_Data.length) {
                await createInputs(page);
            }
            // fill up
            let count = 1;
            for (const data of global_Data) {
                let tag1 = `${global_DataSet.selectors.tablecheck1.fillInvoice}${count}`;
                let tag2 = `${global_DataSet.selectors.tablecheck1.fillStatusPaid}${count}`;
                let tag3 = `${global_DataSet.selectors.tablecheck1.fillStatusUnpaid}${count}`;
                let datum1 = data.Invoice;
                let datum2 = data.Status;
                await page.$(tag1).then(async el => await el.type(datum1).catch(rej => { throw rej })).catch(rej => { throw rej });
                if (datum2 === 'PAID') {
                    await page.$(tag2).then(async el => await el.click().catch(rej => { throw rej })).catch(rej => { throw rej });
                } else if (datum2 === 'UNPAID') {
                    await page.$(tag3).then(async el => await el.click().catch(rej => { throw rej })).catch(rej => { throw rej });
                }
                count++;
            };
        } else if (global_ScrapeDocType === 'invoice') {
            for (const selector in global_DataSet.selectors) {
                const tag = global_DataSet.selectors[selector].fillIn;
                await page.$(tag)
                    .then(async el => {
                        await el.type(global_Data[selector]).catch(rej => { throw rej });
                    })
                    .catch(rej => { throw rej });
            };
        }
    };

    async function takeScreenshot(page) {
        //take a screenshot of the page after filling up and store it in the stack's S3 bucket, passed in the event object
        //I believe S3 expects images to be encoded in base64... this is not TS so I had to remove Bill's implementation with 'as Buffer'
        const screenshot = Buffer.from(await page.screenshot({ fullPage: true }), 'base64');
        const s3 = new aws.S3({ region: outputs.Screenshots_bucket_region.value });
        let timeStamp = new Date().toISOString();
        timeStamp = timeStamp.substring(0, timeStamp.indexOf('.')); // remove the ms part
        timeStamp = timeStamp.replace(':', '-'); // node12 doesnt have replaceAll apparently...
        timeStamp = timeStamp.replace(':', '-');
        const key = `${timeStamp}_${awsRequestId}.png`;
        const ssloc = `${outputs.Screenshots_bucket_domain.value}/${key}`;

        return await s3.putObject({
                Bucket: bucketName,
                Key: key,
                Body: screenshot,
                ContentType: 'image'
            }, (err, data) => {
                err ? console.error(err, data) : null;
            }).promise()
            .then(() => {
                console.log(`FILLER:: Successfully put screenshot on S3 at: ${ssloc}`);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        Message: `Scrape Successful!\n\nYour screenshot can be found at: ${ssloc}\n\nThank you for using VinnyScrape!`,
                        ScreenshotLocation: `${ssloc}`
                    })
                };
            }, (err) => {
                console.error(`FILLER:: Failed to put screenshot on S3: ${err}`);
                return {
                    statusCode: 400,
                    body: `Scrape Unsuccessful!\n\nPlease try again in a few moments!\n\nThank you for using VinnyScrape!`
                }
            });
    };
    // --- END of methods ---

    // --------------------------------------------------------- START OF PROCEDURE  ----------------------------------------------------
    try {
        await determineScrapeTypeAndDataSet();
        let response = { statusCode: 400, body: `SCRAPER:: Doc type cannot be determined! Stopping scraper!` };
        if (!global_ScrapeDocType) return response;

        const browser = await chromium.puppeteer.launch(launchArgs).catch(rej => { throw rej });
        console.log("SCRAPER:: Successfully launched chromium process 🚀🚀🚀");
        const page = await browser.newPage().catch(rej => { throw rej });

        page.on('dialog', async dialog => {
            console.log('Dialog detected, confirming...');
            await dialog.accept();
            console.log('Dialog Confirmed!');
        });

        await page.goto(url.join('?'), { waitUntil: "domcontentloaded" }).catch(rej => { throw rej });
        console.log(`SCRAPER:: Successfully navigated to: ${url.join('?')}`);

        await scrapeData(page)
            .then(data => global_Data = processData(data)).catch(rej => { throw rej });

        // ---------------- form url ------------------- <<<
        const formurl = `${outputs.VS_CF_Domain_name.value}/${outputs.VinnyScrape_fill_path.value}/${global_ScrapeDocType}`;

        await page.goto(formurl, { waitUntil: "domcontentloaded" }).catch(rej => { throw rej });
        console.log(`FILLER:: Successfully navigated to: ${formurl}\nFILLER:: Starting Fill-Up process!`);
        await fillUpForm(page);
        console.log("FILLER:: Done filling up form!");

        await takeScreenshot(page)
            .then(res => {
                response.statusCode = res.statusCode;
                response.body = res.body;
            });

        // *********************************************** Close Connections ****************************************************
        await MClient.close().then(() => console.log('SCRAPER:: Successfully closed MClient connection!'));
        await browser.close().then(() => console.log('SCRAPER:: Successfully closed Chromium instance!'));
        // *********************************************** Close Connections ****************************************************
        return response;
    } catch (rej) {
        console.error(rej);
        return {
            statusCode: 400,
            body: `${rej}`,
        };
    }
    // --------------------------------------------------------- END OF PROCEDURE  ----------------------------------------------------
};

/*
Puppeteer Scraper and Filler - written and developed by Shlomo 'Vinny' Yagolnitser
 */

// - T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -

// No valid local test for this module yet...  :)

// - T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -- T E S T S -