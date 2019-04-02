import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  ButtonContext,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  RadioButton,
} from '@density/ui';

import Modal from '../modal';

import FormLabel from '../form-label';

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
        height={450}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <AppBar>
          <AppBarTitle>Create Token</AppBarTitle>
        </AppBar>
        <div className={styles.tokenCreate}>
          <FormLabel
            label="Token name"
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
            label="Token description"
            htmlFor="token-create-desc"
            input={<InputBox
              type="textarea"
              className={styles.tokenCreateDescriptionField}
              id="token-create-desc"
              value={this.state.description}
              onChange={e => this.setState({description: e.target.value})}
            />}
          />
          <FormLabel
            label="Token Type"
            htmlFor=""
            editable={false}
            input={<div className={styles.tokenCreateTokenTypeRadioGroup}>
              <div className={styles.tokenCreateTokenTypeRadioItem}>
                <RadioButton 
                  name="token-create-token-type"
                  onChange={() => this.setState({tokenType: READONLY})}
                  checked={this.state.tokenType === READONLY}
                  text="Read-Only"
                />
              </div>
              <div className={styles.tokenCreateTokenTypeRadioItem}>
                <RadioButton 
                  name="token-create-token-type"
                  onChange={() => this.setState({tokenType: READWRITE})}
                  checked={this.state.tokenType === READWRITE}
                  text="Read-Write"
                />
              </div>
            </div>}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonContext.Provider value="CANCEL_BUTTON">
                <Button onClick={onDismiss}>Cancel</Button>
              </ButtonContext.Provider>
              <Button
                type="primary"
                disabled={this.state.name.length === 0}
                id="admin-token-create-modal-submit"
                width="100%"
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  tokenType: this.state.tokenType,
                  description: this.state.description || undefined,
                })}
              >Save Token</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
