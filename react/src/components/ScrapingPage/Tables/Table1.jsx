import { createBrowserHistory } from 'history';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Table1.css';

export default function Table1() {
    const history = createBrowserHistory();
    const query = useLocation().search;
    const [isCheckbox, setIsChecked] = useState(query.includes("checkbox=true"));
    const [isExperimental, setIsExperimental] = useState(query.includes("experimental=true"));

    function handleCheck(event) {
        event.stopPropagation();
        let search = history.location.search;
        if (event.target.value === "useCheckbox") {
            console.log('Check Table option: ', !isCheckbox);
            if (!isCheckbox) {
                if (search === '') {
                    history.push(`?checkbox=true`);
                } else {
                    history.push(`${search}&checkbox=true`);
                }
            } else if (isCheckbox) {
                if (history.location.search.includes('&checkbox=true')) {
                    history.push(history.location.search.replace('&checkbox=true', ''));
                } else if (history.location.search.includes('checkbox=true&')) {
                    history.push(history.location.search.replace('checkbox=true&', ''));
                } else if (history.location.search.includes('?checkbox=true')) {
                    history.push(history.location.search.replace('?checkbox=true', ''));
                } else if (history.location.search.includes('?checkbox=true&')) {
                    history.push(history.location.search.replace('?checkbox=true&', '?'));
                }
            }
            setIsChecked(!isCheckbox);
        } else if (event.target.value === "useExperimentalScraper") {
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
        <div className="limiter">
            <div className='checktable-checkbox'>
                Use Check Table
                <input
                    className='checkbox'
                    type="checkbox"
                    checked={isCheckbox}
                    value="useCheckbox"
                    onChange={(event) => handleCheck(event)}
                />
            </div>
            <div className='scraper-checkbox'>
                Use Experimental Scraper(Beta)
                <input
                    className='checkbox'
                    type="checkbox"
                    checked={isExperimental}
                    value="useExperimentalScraper"
                    onChange={(event) => handleCheck(event)}
                />
            </div>
            <div className="container-table100">
                <div className="wrap-table100">
                    <div className="table100">
                        <table className='table1'>
                            <thead className='thead1'>
                                <tr className="table100-head">
                                    <th className="table-th column1">Date ordered</th>
                                    <th className="table-th column2">Order #</th>
                                    <th className="table-th column3">Item</th>
                                    <th className="table-th column4">Price</th>
                                    <th className="table-th column5">Qty</th>
                                    <th className="table-th column6">Total</th>
                                    <th className="table-th column7">Status</th>
                                </tr>
                            </thead>
                            <tbody className='tbody'>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-29 01:22</td>
                                    <td className="td column2">200398</td>
                                    <td className="td column3">iPhone X 64Gb Grey</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-28 05:57</td>
                                    <td className="td column2">200397</td>
                                    <td className="td column3">Samsung S8 Black</td>
                                    <td className="td column4">$756.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$756.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-26 05:57</td>
                                    <td className="td column2">200396</td>
                                    <td className="td column3">Game Console Controller</td>
                                    <td className="td column4">$22.00</td>
                                    <td className="td column5">2</td>
                                    <td className="td column6">$44.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-25 23:06</td>
                                    <td className="td column2">200392</td>
                                    <td className="td column3">USB 3.0 Cable</td>
                                    <td className="td column4">$10.00</td>
                                    <td className="td column5">3</td>
                                    <td className="td column6">$30.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-24 05:57</td>
                                    <td className="td column2">200391</td>
                                    <td className="td column3">Smartwatch 4.0 LTE Wifi</td>
                                    <td className="td column4">$199.00</td>
                                    <td className="td column5">6</td>
                                    <td className="td column6">$1494.00</td>
                                    <td className="td column7">UNPAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-23 05:57</td>
                                    <td className="td column2">200390</td>
                                    <td className="td column3">Camera C430W 4k</td>
                                    <td className="td column4">$699.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$699.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-22 05:57</td>
                                    <td className="td column2">200389</td>
                                    <td className="td column3">Macbook Pro Retina 2017</td>
                                    <td className="td column4">$2199.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$2199.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-21 05:57</td>
                                    <td className="td column2">200388</td>
                                    <td className="td column3">Game Console Controller</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">UNPAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-19 05:57</td>
                                    <td className="td column2">200387</td>
                                    <td className="td column3">iPhone X 64Gb Grey</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-18 05:57</td>
                                    <td className="td column2">200386</td>
                                    <td className="td column3">iPhone X 64Gb Grey</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-22 05:57</td>
                                    <td className="td column2">200389</td>
                                    <td className="td column3">Macbook Pro Retina 2017</td>
                                    <td className="td column4">$2199.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$2199.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-21 05:57</td>
                                    <td className="td column2">200388</td>
                                    <td className="td column3">Game Console Controller</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">UNPAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-19 05:57</td>
                                    <td className="td column2">200387</td>
                                    <td className="td column3">iPhone X 64Gb Grey</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">UNPAID</td>
                                </tr>
                                <tr className="table-tr">
                                    <td className="td column1">2017-09-18 05:57</td>
                                    <td className="td column2">200386</td>
                                    <td className="td column3">iPhone X 64Gb Grey</td>
                                    <td className="td column4">$999.00</td>
                                    <td className="td column5">1</td>
                                    <td className="td column6">$999.00</td>
                                    <td className="td column7">PAID</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}