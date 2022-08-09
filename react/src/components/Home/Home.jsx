import './Home.css';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

export default function HomePage() {

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const codeQuery = query.get('code');

    if (codeQuery) {
        console.log("code query: ", codeQuery);
    }

    return (
        <div className="Home">
            <Navbar />
            <header className="App-header">
                <br></br>
                <br></br>
                <h1 id='h1-header'>Welcome to VinnyScrape - the best scraping demo ever!</h1>
                <h3 id='h3-header'>This is my Puppeteer on Lambda / Terraform / AWS / React.js demo</h3>
                <br></br>
                <br></br>
                <br></br>
                <p> In this demo I will use ReactJS to build a simple Single Page Application with a Scraping page that contains a simple invoice.</p>
                <p> Using Puppeteer on AWS Lambda, I will emulate the Scraping page and scrape some data from the invoice displayed there.</p>
                <p> I will then use Puppeteer to emulate the Forms page to where the scraped data will be entered,</p>
                <p> then a screenshot will be taken and uploaded to S3 and will show up in the Screenshots page, indicating a successful scrape!</p>
                <p> I used a lot of different technologies and languages to make this demo, so you better like it! </p>
                <p className='instructions'> You can start by navigating to the Scraping page and clicking on the big purple button!</p>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <p> Written and designed by Shlomo 'Vinny' Yagolnitser </p>
            </header>
        </div>
    );
};

// CF distro domain: https://dv6ucn6amo941.cloudfront.net

/*
    things to add:

    React:
        - Statistics Page - Status: WIP  
            - Component created, need to figure out a design, nice and simple but interactive

        - Authnetication flow - Status: 0.1 up:
            - User loads app which checks if there is a JWT in local/sessionStorage:
            > Reference: https://auth0.com/docs/secure/security-guidance/data-security/token-storage#browser-local-storage-scenarios
                - If there is, validate the token against 0Auth, if validated the user can proceed normally.
                - If there isnt, a new tab will open with the Cognito HostedUI sign-up/sign-in
            - User can then sign-up and will be redirected back to app with a ?code="" query string
            - In React: Check for code query param,POST 0Auth code recieved from cognito
            > Reference: https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
            - Get a JWT from 0Auth in exchange for a authorization code
            - Store JWT in local/sessionStorage
            * Either: Add checks in all pages for a JWT in storage, or: Somehow add global all-app auth, so that no matter what route the user takes, auth will work


    Internal Users service:
        - users lambda:
            - lambda created
            - currently only serves 1 internal client
            - Full cognito integration - some features disabled on purpose


    Cognito:
            - User pool created and stock 2 users added - testUser and YoavShotland
            - Hosted ui working and redirects properly
            - Stock users working
         

    mongoDB:
            - Full integration with Scraper - Done!
            - Integration with React app - WIP
          
*/