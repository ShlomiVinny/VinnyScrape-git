import React from 'react';
import './ScreenshotsPage.css';
import outputs from '../../outputs.json';
import Navbar from '../Navbar/Navbar';
import { S3Client, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';
import { Buffer } from 'buffer';

export default class ScreenshotsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bucket_name: outputs.Screenshots_bucket.value
        };

        this.handleDeleteAll = this.handleDeleteAll.bind(this);
        this.handleDeleteObj = this.handleDeleteObj.bind(this);
        this.openInNewTab = this.openInNewTab.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
    };

    async getCredentials() {
        if(this.state.credentials) return null;
        const routekey = outputs.ScraperAPI_users_routekey.value.split(' ');
        const method = routekey[0];
        const path = routekey[1];
        const API_endpoint = outputs.ScraperAPI_endpoint.value;
        const user_header = outputs.ScraperAPI_user_header.value.header;
        const header_val = outputs.ScraperAPI_user_header.value.recommended_value;

        const URL = `${API_endpoint}${path}`;
        const gcheaders = new Headers();
        gcheaders.set('Access-Control-Request-Headers', user_header);
        gcheaders.set('Content-Type', 'text/plain');
        gcheaders.set(user_header, header_val);
        const req = new Request(URL, {
            method: method,
            headers: gcheaders,
            mode: 'cors'
        });
        await fetch(req)
            .then(res => this.handleResponse(res))
            .catch(err => { console.error(err) });
    };

    async handleResponse(res) {
        const goodreq = /(\b2\d\d\b)/g;
        const badreq = /(\b4\d\d\b)/g;
        if (res.status.toString().match(goodreq)) {
            const tempcreds = new AWS.Credentials();
            const creds = Buffer.from(await res.text(), 'base64').toString().split(':');
            tempcreds.accessKeyId = creds[0];
            tempcreds.secretAccessKey = creds[1];
            this.setState({ credentials: tempcreds }, () => {
                this.getScreenshots(tempcreds);
            });
        } else if (res.status.toString().match(badreq)) {
            await res.text().then(text => {
                console.log(`Could NOT get creds: ${text}`);
            })
        }
    }

    getS3Client(creds) {
        // Set the AWS Region
        const REGION = "eu-west-2"; // London 
        const credentials = creds;

        return new S3Client({
            region: REGION,
            credentials: credentials
        });
    };

    async listObjectsOfBucket(bucket_name, creds) {
        const s3Client = this.getS3Client(creds);
        const command = new ListObjectsCommand({ Bucket: bucket_name });
        const response = await s3Client.send(command);
        let keys = [];
        if (response.Contents) {
            response.Contents.forEach((entry) => {
                keys.push(entry.Key);
            })
        }
        this.setState({ keys: keys });
        return keys;
    };

    createScreenshotTemplate(keys) {
        if (keys.length === 0) {
            let temp = <div>
                NO SCREENSHOTS TO SHOW
            </div>
            this.setState({ template: temp, noScreenshots: true });
        } else {
            let temp = keys.map((key, i) => {
                return (
                    <div className='screenshot-container' key={i}>
                        <div className='screenshot-header'>
                            <h5>{key}</h5>
                            <div className='screenshot-buttons'>
                                <button className='vinnyscrape-btn-small' onClick={this.downloadFile} value={key}>Download</button>
                                <button className='vinnyscrape-btn-small' onClick={this.openInNewTab} value={key}>Open in new tab</button>
                                <button className='vinnyscrape-btn-small' onClick={this.handleDeleteObj} name={key}>Delete Screenshot</button>
                            </div>
                        </div>
                        <img className='screenshot' src={`${outputs.Screenshots_bucket_domain.value}/${key}`} alt=''></img>
                        <br></br>
                    </div>
                )
            })
            this.setState({ template: temp, noScreenshots: false });
        }
    };

    async getScreenshots(creds) {
        await this.listObjectsOfBucket(this.state.bucket_name, creds)
            .then(keys => this.createScreenshotTemplate(keys))
            .catch(err => console.error("Get screenshots error: ", err));

    };

    componentDidMount() {
        this.getCredentials();
    };

    authChecks() {
        let bool = localStorage.getItem('vs-auth-checks') ?? false;
        if (bool === 'true') return true;
        return bool;
    }

    displayNoPermissionAlert() {
        alert('No permission!!!\n\nPlease Sign-in first if you have a VinnyScrape account!\n\nOr Sign-up by clicking the sign-up button at the top of the page!');
    }

    openInNewTab(event) {
        event.preventDefault();
        let url = `${outputs.Screenshots_bucket_domain.value}/${event.target.value}`;
        window.open(url, '_blank').focus();
    }

    async downloadFile(event) {
        event.preventDefault();
        const client = this.getS3Client(this.state.credentials);
        const command = new GetObjectCommand({ Bucket: this.state.bucket_name, Key: event.target.value });
        const response = await client.send(command).catch(err => console.error(err));
        if (response.ContentType === 'image') {
            let res = new Response(response.Body);
            let blob = await res.blob();
            const handle = await window.showSaveFilePicker({
                suggestedName: `${event.target.value}.png`,
                types: [
                    {
                        description: ".png",
                        accept: {
                            "image/png": [".png"]
                        }
                    }
                ]
            }).catch(err => console.error(err));
            const writable = await handle.createWritable().catch(err => console.error(err));
            await writable.write(blob).catch(err => console.error(err));
            writable.close();
        }
    }

    async handleDeleteAll() {
        const code = localStorage.getItem('vs-auth-code');
        const check = this.authChecks();
        if (check && code) {
            console.log(`Auth checks: ${check} code: ${code}`);
            const s3Client = this.getS3Client(this.state.credentials);
            await Promise.all(this.state.keys.map(async key => {
                const command = new DeleteObjectCommand({ Bucket: this.state.bucket_name, Key: key });
                await s3Client.send(command)
                    .catch(err => console.error(err));
            }))
                .then(alert('Successfully deleted all screenshots!'))
                .catch(err => { console.error(err); alert('Could NOT delete screenshots...\n\nPlease try again later!') });
            // end of Promise.all()
            this.setState({ keys: [] });
            this.createScreenshotTemplate([]);
        } else {
            this.displayNoPermissionAlert();
        }
    };

    async handleDeleteObj(event) {
        event.preventDefault();
        const code = localStorage.getItem('vs-auth-code');
        const check = this.authChecks();
        if (check && code) {
            const s3Client = this.getS3Client(this.state.credentials);
            const command = new DeleteObjectCommand({ Bucket: this.state.bucket_name, Key: event.target.name });
            await s3Client.send(command)
                .then(alert('Successfully deleted screenshot!'))
                .catch(err => { console.error(err); alert('Could NOT delete screenshot...\n\nPlease try again!') });

            let keys = this.state.keys.filter(key => key !== event.target.name);
            this.setState({ keys: keys });
            this.createScreenshotTemplate(keys);
        } else {
            this.displayNoPermissionAlert();
        }
    };

    render() {
        if (this.state.template === undefined) {
            return (
                <div className="screenshots-wrapper">
                    <Navbar />
                    <div className="invoice-box">
                        LOADING...
                    </div>
                </div>
            );
        } else {
            return (
                <div className="screenshots-wrapper">
                    <Navbar />
                    <button
                        className='vinnyscrape-btn-small delete-all'
                        type="button"
                        disabled={this.state.noScreenshots}
                        onClick={this.handleDeleteAll}>
                        Delete All Screenshots
                    </button>
                    <div className="invoice-box">
                        {this.state.template}
                    </div>
                </div>
            );
        }
    };
};