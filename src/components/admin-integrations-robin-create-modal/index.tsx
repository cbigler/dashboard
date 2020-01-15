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
} from '@density/ui/src';

import FormLabel from '../form-label';

export default class IntegrationsRobinCreateModal extends React.Component<any, any> {
  state = {
    robin_access_token: '',
    robin_organization_id: '',
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
              value={this.state.robin_access_token}
              onChange={e => this.setState({robin_access_token: e.target.value})}
            />}
          />
          <FormLabel
            label="Robin Organization ID"
            htmlFor="create-organization-id"
            input={<InputBox
              type="text"
              id="create-organization-id"
              width="100%"
              value={this.state.robin_organization_id}
              onChange={e => this.setState({robin_organization_id: e.target.value})}
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
                  disabled={this.state.robin_access_token.length === 0 && this.state.robin_organization_id.length === 0}
                  onClick={() => this.props.onSubmit({
                    credentials: {
                      robin_access_token: this.state.robin_access_token,
                      robin_organization_id: this.state.robin_organization_id,
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
