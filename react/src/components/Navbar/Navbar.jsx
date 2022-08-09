import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import outputs from '../../outputs.json';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const codeQuery = query.get('code');
    const origin = window.location.origin;
    const localAuthCode = localStorage.getItem('vs-auth-code');
    const authChecksStatus = localStorage.getItem('vs-auth-checks') ?? 'true';
    const backDropEleClass = 'message-backdrop';
    const [authMessageClasses, setAuthMessageClasses] = useState(`${backDropEleClass} hidden`);

    async function verifyAuthCode(code) {
        const API_endpoint = outputs.ScraperAPI_endpoint.value;
        const verifyuser_routekey = outputs.ScraperAPI_verifyuser_routekey.value.split(' ');
        const method = verifyuser_routekey[0];
        const path = verifyuser_routekey[1];

        const vacheaders = new Headers();
        vacheaders.set('Content-Type', 'text/plain');
        vacheaders.set('x-vs-auth-code', code);
        vacheaders.set('x-vs-redirect-uri', origin);

        const URL = `${API_endpoint}${path}`;

        await fetch(URL, {
            method: method,
            headers: vacheaders,
            mode: 'cors',
        }).then(res => handleVerificationResponse(res, code))
            .catch(err => console.error("Error: ", err));
    }

    async function handleVerificationResponse(res, code) {
        res = await res.json();
        console.log(res);
        const goodreq = /(\b2\d\d\b)/g;
        const badreq = /(\b4\d\d\b)/g;
        if (res.statusCode.toString().match(goodreq)) {
            localStorage.setItem('vs-auth-code', code);
            console.log(`Set auth code in localStorage`);
        } else if (res.statusCode.toString().match(badreq)) {
            if (localAuthCode) {
                localStorage.removeItem('vs-auth-code');
                console.log(`Removed auth code from localStorage`);
            }
            console.log("Pretend to redirect to signup...");
             redirectToSignup();
        }
    }

    function redirectToSignup() {
        // redirect the user to my signup page
        const domain = `${outputs.VS_Cognito_userpool_domain_full.value}/signup`;
        const client_id = `client_id=${outputs.VS_Cognito_userpool_client_id.value}`;
        const response_type = outputs.VS_Cognito_hostedui_queryParams.value.response_type_param;
        const scope = outputs.VS_Cognito_hostedui_queryParams.value.scope_param;
        const redirect_uri = `redirect_uri=${origin}`;

        const fullUrl = `${domain}?${client_id}&${response_type}&${scope}&${redirect_uri}`; // NO TRAILING '/' SLASHES!!!!!!! FFS 0AUTH!
        console.log("Redirecting to: ", fullUrl);
        alert('You will now be redirected to Sign Up!');
        setTimeout(() => {
            window.location.assign(fullUrl);
        }, 1000);
    }

    function enableAuthChecks() {
        localStorage.setItem('vs-auth-checks', true);
        alert('Auth checks enabled!');
        console.log('Auth checks enabled!');
    }

    function disableAuthChecks() {
        localStorage.setItem('vs-auth-checks', false);
        setAuthMessageClasses(`${backDropEleClass} hidden`);
        alert('Auth checks disabled!');
        console.log('Auth checks disabled!');
    }

    function clearAuthCodeFromLS() {
        localStorage.removeItem('vs-auth-code');
    }

    async function authChecks() {
        if (codeQuery && !localAuthCode && authChecksStatus === "true") {// returns null if empty so !null = truthy and !truthy = falsey, good enough
            console.log("Verifying URL param code, code: ", codeQuery);
            verifyAuthCode(codeQuery);
        } else if (!codeQuery && localAuthCode && authChecksStatus === "true") {
            console.log("Verifying local code: ", localAuthCode);
            // console.log("****** add verification code later... *******");
            verifyAuthCode(localAuthCode);
        } else if (authChecksStatus === "false") {
            console.log('Auth checks are currently disabled... status: ', authChecksStatus);
        } else if (authChecksStatus === "true") {
            console.log(`Auth checks are currently enabled! status: ${authChecksStatus}`);
            if (!codeQuery && !localAuthCode) {
                console.log('No code found! Display auth message in 3 secs...');
                setTimeout(() => {
                    setAuthMessageClasses(`${backDropEleClass} visible`);
                }, 3000);
            }
        }
    }

    authChecks();

    return (
        <div className='navbar-container'>
            <div className="navbar-wrapper">
                <img className='logo' src="https://static.wixstatic.com/media/3f1d91_e7b02584c1cc480b9ca9f61efe32b039~mv2.png/v1/fill/w_140,h_38,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Logo.png" alt=""></img>
                <img className='logo' src="./svcreationslogo.png" alt=''></img>
                <Link className='router-link' to={"/"}>Home</Link>
                <Link className='router-link' to={'/forms'}>Forms</Link>
                <Link className='router-link' to={'/scraping'}>Scraping</Link>
                <Link className='router-link' to={'/screenshots'}>Screenshots</Link>
                <Link className='router-link' to={'/statistics'}>Statistics</Link>
                <button className='signup' onClick={() => redirectToSignup()} >Sign-up / Sign-in</button>
            </div>
            <div className='dev-buttons'>
                Dev buttons:
                <button onClick={() => enableAuthChecks()} style={{ marginLeft: '10px' }}>Enable Auth Checks</button>
                <button onClick={() => disableAuthChecks()} style={{ marginLeft: '10px' }}>Disable Auth Checks</button>
                <button onClick={() => clearAuthCodeFromLS()} style={{ marginLeft: '10px' }}>Clear Auth Code</button>
            </div>
            <div className={authMessageClasses}>
                <div className='auth-message'>
                    <h1>ERROR:</h1>
                    <h4>No authentication details found!</h4>
                    <p>Please Sign-in if youre not signed in!</p>
                    <p>If you do not have a VinnyScrape account you can always Sign-up by clicking the Sign-in / Sign-up button!</p>
                    <p>If you choose not to Sign-up, some features will be disabled!</p>
                    <div className='buttons'>
                        <button className='vinnyscrape-btn-small wide' onClick={() => disableAuthChecks()}>Continue without signup</button>
                        <button className='vinnyscrape-btn-small' onClick={() => redirectToSignup()}>Go to signup</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
