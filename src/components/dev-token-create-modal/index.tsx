import * as React from 'react';

import {
  Button,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
} from '@density/ui';

import Modal from '../modal/index';

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
    const { visible, onDismiss } = this.props;
    return (
      <Modal
        visible={visible}
        width={460}
        height={492}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <AppBar>
          <AppBarTitle>Create Token</AppBarTitle>
        </AppBar>
        <div className="token-create">
          <FormLabel
            className="token-create-name-container"
            label="Token Name"
            htmlFor="update-token-name"
            input={<InputBox
              type="text"
              id="update-token-name"
              width="100%"
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
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <Button
                type="primary"
                disabled={this.state.name.length === 0}
                id="dev-token-create-modal-submit"
                width="100%"
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  description: this.state.description,
                  tokenType: this.state.tokenType,
                })}
              >Save Token</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
