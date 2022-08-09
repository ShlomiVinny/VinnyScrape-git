import React from 'react';
import './Statistics.css';
import outputs from '../../outputs.json';
import Navbar from '../Navbar/Navbar';

export default class StatisticsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    async callDAL() {
        const names = ['invoice-module', 'table-module'];
        let data = [];
        for (const name of names) {
            let a = await this.getData(name);
            data.push(a);
        }
        this.createTemplate(data);
    }

    async getData(name) {
        const API_endpoint = outputs.ScraperAPI_endpoint.value;
        let url = `${API_endpoint}/${name}`;
        let res = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        }).catch(err => console.error(err));
        return await res.json();
    }

    createTemplate(data) {
        let template = [];
        console.log('Creating template...');

        data.forEach(DataSet => {
            let keys = Object.keys(DataSet.selectors);
            template.push(Object.values(DataSet.selectors).map((selector, i) => {
                return (
                    <div key={i} className='statistics-card'>
                        <h3 id='h3-header'>{keys[i]}</h3>
                        <span className='header-span'>Selector: <span className='value-span'>{selector.searchFor}</span></span>
                        <span className='header-span'>Fill In selector:<span className='value-span'>{selector.fillIn}</span></span>
                        <span className='header-span times'>Times Scraped:<span className='value-span number'>{selector.timesScraped}</span></span>
                    </div>
                )
            }
            )
            )
        })

        this.setState({ template: template })
        // console.log("template",template);
    }

    componentDidMount() {
        this.callDAL();
    }

    render() {
        if (this.state.template === undefined) {
            return (
                <div className="statistics-wrapper">
                    <Navbar />
                    <h1 id='h1-header'>Statistics</h1>
                    <div className='statistics'>
                        <div className="loading-msg">
                            LOADING...
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="statistics-wrapper">
                    <Navbar />
                    <h1 id='h1-header'>Statistics</h1>
                    <div className='statistics'>

                        {this.state.template}

                    </div>
                </div>
            )
        }
    }
};