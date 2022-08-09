import { Link, Route, useLocation, Routes } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Navbar from '../Navbar/Navbar';
import Table1 from './Tables/Table1';
import Invoice1 from './Invoices/Invoice1';
import outputs from '../../outputs.json';
import './ScrapingPage.css';
import { useState } from 'react';

export default function ScrapingPage() {
    const [processing, setProcessing] = useState(false);
    let procClasses = '';

    let activeLink = '';
    function setActiveLink(link) {
        activeLink = link;
    }

    let disableScraping = true;
    function setDisableScraping(value) {
        disableScraping = value;
    }

    let scrapingBtnText = '';
    function setScrapingBtnText(value) {
        scrapingBtnText = value;
    }

    const location = useLocation();
    let currentPath = location.pathname;
    if (currentPath === '/scraping/tables') {
        setActiveLink('Tables');
        setDisableScraping(false);
    } else if (currentPath === '/scraping/invoices') {
        setActiveLink('Invoices');
        setDisableScraping(false);
    }

    if (disableScraping) {
        setScrapingBtnText('Select an element first!');
    } else if (!disableScraping) {
        setScrapingBtnText('Click here to scrape some data!');
    }

    if (processing) {
        procClasses = 'processing-msg visible';
    } else if (!processing) {
        procClasses = 'processing-msg hidden';
    }

    async function handleResponse(res) {
        setProcessing(false);
        if (res.status === 200) {
            await res.json()
                .then(body => {
                    if (body.Payload) {
                        let payload = JSON.parse(body.Payload);
                        if (payload.StatusCode === 200) {
                            let data = JSON.parse(payload.Payload);
                            console.log(data.ScreenshotLocation);
                            alert(`${data.Message}`);
                        } else {
                            alert(`Server responded with:\nStatus:${payload.StatusCode}\n\n${payload.Payload}`);
                        }
                    } else {
                        alert(`Server responded with: ${body}`);
                    }
                });
        } else {
            await res.text()
                .then(body => {
                    alert(`Server responded with: ${body}`);
                })
        }
    };

    async function handleClick() {
        setProcessing(true);
        const history = createBrowserHistory();
        let search = history.location.search;
        const API_endpoint = outputs.ScraperAPI_endpoint.value;
        const ScraperURL = search.includes('experimental=true') ? `${API_endpoint}/scrape/layered` : `${API_endpoint}/scrape`;
        console.log(ScraperURL);
        const code = localStorage.getItem('vs-auth-code');
        const authChecksStatus = localStorage.getItem('vs-auth-checks');

        if (authChecksStatus === "true" && code) {
            console.log(`Auth checks status: ${authChecksStatus}, code: ${code} Requesting scrape...`);
            const headers = new Headers();
            headers.set('Access-Control-Request-Headers', 'vinnyscrape-path');
            headers.set('Content-Type', 'application/json');
            headers.set('vinnyscrape-path', location.pathname.concat(search.includes('checkbox=true') ? '?checkbox=true' : ''));
            headers.set('x-vs-auth-code', code);
            const req = new Request(ScraperURL, {
                method: 'GET',
                headers: headers,
                mode: 'cors'
            });
            await fetch(req)
                .then(res => handleResponse(res))
                .catch(err => { console.error(err); alert(err) });
        } else if (authChecksStatus === "false") {
            console.log(`Auth check are disabled! Status: ${authChecksStatus}`);
            alert('ERROR: Auth checks are disabled!\n\nCannot request scrape at this time...\nPlease sign-in first...')
        } else {
            console.log(`No Permission!:: Auth check are enabled! Status: ${authChecksStatus} `);
            alert('ERROR: No permission!!!\n\nPlease Sign-in if youre not signed in!\nIf you do not have a VinnyScrape account you can always Sign-up...')
        }
    };

    return (
        <div className="scraping-container">
            <Navbar />
            <button
                disabled={disableScraping}
                type="button"
                className="vinnyscrape-btn-large"
                onClick={() => { handleClick() }}>
                {scrapingBtnText}
            </button>
            <div className={procClasses}>
                Processing! Please wait...
            </div>
            <div className='scraping-links'>
                <Link
                    className={`scraping-link ${activeLink === "Tables" ? 'active' : ''}`}
                    to={"tables"}
                    onClick={(event) => setActiveLink(event.currentTarget.innerText)}>
                    Tables
                </Link>
                <Link
                    className={`scraping-link ${activeLink === "Invoices" ? 'active' : ''}`}
                    to={"invoices"}
                    onClick={(event) => setActiveLink(event.currentTarget.innerText)}>
                    Invoices
                </Link>
            </div>
            <div className='scraping-outlet'>
                <Routes>
                    <Route path={"invoices"} element={<Invoice1 />} />
                    <Route path={"tables"} element={<Table1 />} />
                </Routes>
            </div>
        </div>
    );
};