import React from 'react';

export default class RenderInput extends React.Component {
    render() {
        return (
            <div className="col clr">
                <label htmlFor="renderInput" className="form-label">Ciphertext</label>
                <textarea 
                    value={this.props.input}
                    className="form-control mb-2"
                    type="text" 
                    id="renderInput"
                    rows="12"
                    readOnly></textarea>
            </div>
        )
    }
}