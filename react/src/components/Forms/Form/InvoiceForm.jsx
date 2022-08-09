import React from 'react';
import './Form.css';
import outputs from '../../../outputs.json';

export default class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: []
    };
    this.handleChange = this.handleChange.bind(this); // scope binding bs, great react! just great!
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
  };

  handleChange(event) {
    event.preventDefault();
    // update state on form input change
    console.log({ [event.target.name]: event.target.value });
    this.setState({ [event.target.name]: event.target.value })
  };

  handleResponse(res) {
    res.text()
      .then(body => alert(`Server responded with status: ${res.status}\n\n${body}`));
  };

  async handleSubmit(event) {
    event.preventDefault();
    // ------------------------- APIGW url ----------------------
    const url = `${outputs.ScraperAPI_endpoint.value}/validate`;
    const body = this.createRequestBody();
    const headers = new Headers();
    headers.set('Access-Control-Request-Headers', 'Access-Control-Allow-Origin');
    headers.set('Access-Control-Request-Headers', 'vinnyscrape-path');
    headers.set('Content-Type', 'application/json');
    headers.set('vinnyscrape-path', '/Forms');
    const req = new Request(url, {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      body: JSON.stringify(body)
    });
    await fetch(req)
      .then(res => this.handleResponse(res), err => alert(err))
  };

  createRequestBody() {
    const formData = this.getFormData();
    let data = {};
    formData.map(label => this.state[label.name] !== undefined ? data[label.name] = this.state[label.name] : null);
    return data;
  };

  getFormData() {
    return [
      //{ label: "", name: "", type:""},
      { label: "Invoice #", name: "invoiceId", type: "number" },
      { label: "Client Name", name: "client", type: "text" },
      { label: "Client Address", name: "clientAddr", type: "text" },
      { label: "Client Phone Number", name: "clientPhone", type: "text" },
      { label: "Client Email", name: "clientEmail", type: "email" },
      { label: "Date Of Invoice", name: "dateInvoice", type: "date" },
      { label: "Due Date", name: "dateInvoiceDue", type: "date" },
      { label: "_seperator" },
    ];
  };

  createForm(type) { // called in ComponentDidMount()
    let formData = this.getFormData(type);
    let form = [];

    form = formData.map((label, i) => {
      if (label.label === "_seperator") return <div key={i + formData.length} className='seperator'> --- </div>;
      if (label.name) this.setState({ [label.name.concat(i)]: undefined });
      return (
        <label key={i} className="form-label">
          {label.label}:
          <input className={`label-input ${label.name}`} type={label.type} name={label.name.concat(i)} value={this.state[label.name.concat(i)]} onChange={this.handleChange} />
        </label>
      )
    });

    this.setState({ form: form });
  };

  componentDidMount() {
    this.createForm(this.props.type);
  };

  render() {
    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <legend>Invoice Form</legend>
        <fieldset className='form'>
        {this.state.form}
        </fieldset>
        <input className='vinnyscrape-btn-large' id='submit' type="submit" value="Submit" />
      </form>
    );
  }
};