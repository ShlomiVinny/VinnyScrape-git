import { createBrowserHistory } from 'history';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Invoice1.css';

export default function Invoice1() {
    const history = createBrowserHistory();
    const query = useLocation().search;
    const [isExperimental, setIsExperimental] = useState(query.includes("experimental=true"));

    function handleCheck(event) {
        event.stopPropagation();
        let search = history.location.search;
        if (event.target.value === "useExperimentalScraper") {
            console.log('Use Experimental Scraper option: ', !isExperimental);
            if (!isExperimental) {
                if (search === '') {
                    history.push('?experimental=true')
                } else {
                    history.push(`${search}&experimental=true`)
                }
            } else if (isExperimental) {
                if (history.location.search.includes('&experimental=true')) {
                    history.push(history.location.search.replace('&experimental=true', ''));
                } else if (history.location.search.includes('experimental=true&')) {
                    history.push(history.location.search.replace('experimental=true&', ''));
                } else if (history.location.search.includes('?experimental=true')) {
                    history.push(history.location.search.replace('?experimental=true', ''));
                } else if (history.location.search.includes('?experimental=true&')) {
                    history.push(history.location.search.replace('?experimental=true&', '?'));
                }
            }
            setIsExperimental(!isExperimental);
        }
    }

    return (
        <div className="invoice-wrapper">
            <div className='scraper-checkbox-invoice'>
                Use Experimental Scraper(Beta)
                <input
                    className='checkbox'
                    type="checkbox"
                    checked={isExperimental}
                    value="useExperimentalScraper"
                    onChange={(event) => handleCheck(event)}
                />
            </div>
            <div className="card-body">
                <div id="invoice">
                    <div className="invoice overflow-auto">
                        <div>
                            <header>
                                <div className="row">
                                    <div className="col company-details">
                                        INVOICE FROM:
                                        <h2 className="company-name text-black">
                                            Arboshiki Inc.
                                        </h2>
                                        <div className='company-address'>455 Foggy Heights, AZ 85004, US</div>
                                        <div className='company-phone'>(123) 456-789</div>
                                        <div className='company-email'>company@arboshiki.com</div>
                                    </div>
                                </div>
                            </header>
                            <main className='invoice-main'>
                                <div className="row contacts">
                                    <div className="col invoice-to">
                                        <div className="text-gray-light">INVOICE TO:</div>
                                        <h2 className="to text-black">Amazona Inc.</h2>
                                        <div className="address text-gray-light">1 Amazona Lane, TX 12345, US</div>
                                        <div className="email text-gray-light"><a href="mailto:sales@amazona.com">sales@amazona.com</a>
                                        </div>
                                    </div>
                                    <div className="col invoice-details">
                                        <h1 className="invoice-id text-gray-light">Invoice 21341</h1>
                                        <div className="date text-gray-light">Date of Invoice: 01/10/2018</div>
                                        <div className="date dueDate text-gray-light">Due Date: 30/10/2018</div>
                                    </div>
                                </div>
                                <table className='invoice-table'>
                                    <thead>
                                        <tr className="invoice-tr">
                                            <th className='invoice-th'>#</th>
                                            <th className="text-left invoice-th">DESCRIPTION</th>
                                            <th className="text-right invoice-th">HOUR PRICE</th>
                                            <th className="text-right invoice-th">HOURS</th>
                                            <th className="text-right invoice-th">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className='invoice-tbody'>
                                        <tr className="invoice-tr">
                                            <td className="invoice-td  no">01</td>
                                            <td className="invoice-td  description text-left">
                                                <h3 className="table-h3">Website Design</h3>Creating a recognizable design solution based on the company's existing visual identity</td>
                                            <td className="invoice-td  unit">$40.00</td>
                                            <td className="invoice-td  qty">30</td>
                                            <td className="invoice-td  total">$1,200.00</td>
                                        </tr>
                                        <tr className="invoice-tr">
                                            <td className="invoice-td  no">02</td>
                                            <td className="invoice-td  text-left">
                                                <h3 className="table-h3">Website Development</h3>Developing a Content Management System-based Website</td>
                                            <td className="invoice-td  unit">$40.00</td>
                                            <td className="invoice-td  qty">80</td>
                                            <td className="invoice-td  total">$3,200.00</td>
                                        </tr>
                                        <tr className="invoice-tr">
                                            <td className="invoice-td  no">03</td>
                                            <td className="invoice-td  text-left">
                                                <h3 className="table-h3">Search Engines Optimization</h3>Optimize the site for search engines (SEO)</td>
                                            <td className="invoice-td  unit">$40.00</td>
                                            <td className="invoice-td  qty">20</td>
                                            <td className="invoice-td  total">$800.00</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="invoice-tr">
                                            <td colSpan="2"></td>
                                            <td colSpan="2">SUBTOTAL</td>
                                            <td>$5,200.00</td>
                                        </tr>
                                        <tr className="invoice-tr">
                                            <td colSpan="2"></td>
                                            <td colSpan="2">TAX 25%</td>
                                            <td>$1,300.00</td>
                                        </tr>
                                        <tr className="invoice-tr">
                                            <td colSpan="2"></td>
                                            <td colSpan="2">GRAND TOTAL</td>
                                            <td>$6,500.00</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div className="thanks">Thank you!</div>
                                <div className="notices">
                                    <div>NOTICE:</div>
                                    <div className="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                                </div>
                            </main>
                            <footer>
                                Invoice was created on a computer and is valid without the signature and seal.
                                Created by someone, Modified by Vinny
                            </footer>
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    )
}