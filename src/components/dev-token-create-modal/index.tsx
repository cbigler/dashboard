import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  InputBox,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label/index';

const READONLY = 'readonly', READWRITE = 'readwrite';

export default class TokenCreate extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      tokenType: READONLY,
    };
  }
  render() {
    return <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
      <div className="token-create">
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <CardHeader>Create token</CardHeader>

          <CardBody>
            <FormLabel
              className="token-create-name-container"
              label="Token Name"
              htmlFor="update-token-name"
              input={<InputBox
                type="text"
                id="update-token-name"
                value={this.state.name}
                onChange={e => this.setState({name: e.target.value})}
              />}
            />
            <FormLabel
              className="token-create-description-container"
              label="Token description"
              htmlFor="token-create-desc"
              input={<InputBox
                type="textarea"
                className="token-create-description-field"
                id="token-create-desc"
                value={this.state.description}
                onChange={e => this.setState({description: e.target.value})}
              />}
            />
            <FormLabel
              className="token-create-token-type-container"
              label="Token Type"
              htmlFor=""
              editable={false}
              input={<div className="token-create-token-type-radio-group">
                <div className="token-create-token-type-radio-item">
                  <input
                    type="radio"
                    id="token-create-token-type-read-only"
                    onChange={() => this.setState({tokenType: READONLY})}
                    checked={this.state.tokenType === READONLY}
                  />
                  <label htmlFor="token-create-token-type-read-only">Read Only</label>
                </div>
                <div className="token-create-token-type-radio-item">
                  <input
                    type="radio"
                    id="token-create-token-type-read-write"
                    onChange={() => this.setState({tokenType: READWRITE})}
                    checked={this.state.tokenType === READWRITE}
                  />
                  <label htmlFor="token-create-token-type-read-write">Read Write</label>
                </div>
              </div>}
            />

            <div className="token-create-modal-submit">
              <Button
                disabled={this.state.name.length === 0}
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  description: this.state.description,
                  tokenType: this.state.tokenType,
                })}
              >Submit</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Modal>;
  }
}
