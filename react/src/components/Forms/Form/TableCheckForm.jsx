import React from 'react';
import './Form.css';

export default class TableCheckForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            form: [],
            inputCount: 1
        };

        this.addFieldset = this.addFieldset.bind(this);
        this.removeFieldset = this.removeFieldset.bind(this);
    };

    getFormData() {
        return [
            //{ label: "", name: "", type:""},
            [
                { label: "Invoice #", name: "invoiceId", type: "number" },
                { label: "Status", name: "invoiceStatus", type: "checkbox" }
            ]
        ];
    };

    addFieldset(event) {
        event.preventDefault();
        let a = this.state.inputCount;
        if (a < 49) {
            this.setState({ inputCount: a + 1 })
            this.createForm(a + 1);
        } else {
            console.log('Cannot create anymore fieldsets! Max of 50 reached!');
        }

    }

    removeFieldset(event) {
        event.preventDefault();
        this.setState({ [event.target.name]: undefined });
        let a = this.state.inputCount;
        if (a > 0) {
            this.setState({ inputCount: a - 1 })
            this.createForm(a - 1);
        } else {
            console.log("Form is at 0 fields, cannot remove any further...");
        }
    }

    createForm(count) {
        console.log(`Creating form with: ${count} field(s)`);
        let formData = this.getFormData();
        let form = [];
        let c = count;
        while (c > 0) {
            form.unshift(formData.map((label, i) => {
                return (
                    <fieldset key={i} className='table-fieldset'>
                        {`${c}`}
                        {label.map((label, j) => {
                            if (label.type === 'checkbox') {
                                return (
                                    <div className='check-wrapper'>
                                        {label.label}:
                                        <label key={j} className="check-label">
                                            Paid:
                                            <input
                                                className={`check-input ${label.name}Paid${c}`}
                                                type={label.type}
                                                name={label.name}
                                            ></input>
                                            Unpaid:
                                            <input
                                                className={`check-input ${label.name}Unpaid${c}`}
                                                type={label.type}
                                                name={label.name}
                                            />
                                        </label>
                                    </div>
                                )
                            }
                            return (
                                <label key={j} className="form-label">
                                    {label.label}:
                                    <input
                                        className={`label-input ${label.name}${c}`}
                                        type={label.type}
                                        name={label.name}
                                    />
                                </label>
                            )
                        }
                        )}
                    </fieldset>
                )
            }))
            c--;
        }

        this.setState({ form: form });
    };

    componentDidMount() {
        this.createForm(this.state.inputCount);
    };

    render() {
        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <div>
                    <input type={"button"} value="Add Another Fieldset" className='field-btn vinnyscrape-btn-small' onClick={this.addFieldset}></input>
                    <input type={"button"} value="Remove Fieldset" className='field-btn vinnyscrape-btn-small' onClick={this.removeFieldset}></input>
                </div>
                <legend>{this.props.formName}</legend>
                {this.state.form}
                <input className='vinnyscrape-btn-large' id='submit' type="submit" value="Submit" />
            </form>
        );
    };
}