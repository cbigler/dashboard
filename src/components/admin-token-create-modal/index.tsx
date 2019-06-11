import styles from './styles.module.scss';

import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  InputBox,
  RadioButton,
  Modal,
} from '@density/ui';

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
            label="Token type"
            htmlFor=""
            editable={false}
            input={<div className={styles.tokenCreateTokenTypeRadioGroup}>
              <div className={styles.tokenCreateTokenTypeRadioItem}>
                <RadioButton 
                  name="token-create-token-type"
                  onChange={() => this.setState({tokenType: READONLY})}
                  checked={this.state.tokenType === READONLY}
                  text="Read-only"
                />
              </div>
              <div className={styles.tokenCreateTokenTypeRadioItem}>
                <RadioButton 
                  name="token-create-token-type"
                  onChange={() => this.setState({tokenType: READWRITE})}
                  checked={this.state.tokenType === READWRITE}
                  text="Read-write"
                />
              </div>
            </div>}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={this.state.name.length === 0}
                  id="admin-token-create-modal-submit"
                  onClick={() => this.props.onSubmit({
                    name: this.state.name,
                    tokenType: this.state.tokenType,
                    description: this.state.description || undefined,
                  })}
                >Save token</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
