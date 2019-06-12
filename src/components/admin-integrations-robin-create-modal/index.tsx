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
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

export default class IntegrationsRobinCreateModal extends React.Component<any, any> {
  state = {
    robinAccessToken: '',
    robinOrganizationId: '',
  }

  render() {
    const { visible, onDismiss } = this.props;
    return (
      <Modal
        visible={visible}
        width={460}
        height={340}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <AppBar>
          <AppBarTitle>Connect with Robin</AppBarTitle>
        </AppBar>
        <div className={styles.integrationsCreate}>
          <FormLabel
            label="Robin API Token"
            htmlFor="create-token"
            input={<InputBox
              type="text"
              id="create-token"
              width="100%"
              value={this.state.robinAccessToken}
              onChange={e => this.setState({robinAccessToken: e.target.value})}
            />}
          />
          <FormLabel
            label="Robin Organization ID"
            htmlFor="create-organization-id"
            input={<InputBox
              type="text"
              id="create-organization-id"
              width="100%"
              value={this.state.robinOrganizationId}
              onChange={e => this.setState({robinOrganizationId: e.target.value})}
            />}
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
                  disabled={this.state.robinAccessToken.length === 0 && this.state.robinOrganizationId.length === 0}
                  onClick={() => this.props.onSubmit({
                    credentials: {
                      robinAccessToken: this.state.robinAccessToken,
                      robinOrganizationId: this.state.robinOrganizationId,
                    }
                  })}
                >Save</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
