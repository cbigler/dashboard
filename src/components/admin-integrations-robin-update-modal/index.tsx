import React from 'react';

import {
  Button,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
} from '@density/ui';

import FormLabel from '../form-label';
import Modal from '../modal';
import { CancelLink } from '../dialogger';

export default class IntegrationsRobinUpdateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      robinAccessToken: this.props.initialServiceAuthorization.credentials.robinAccessToken,
      robinOrganizationId: this.props.initialServiceAuthorization.credentials.robinOrganizationId,
      default: this.props.initialServiceAuthorization.default,
      
      destroyRobinOrganizationIdConfirmation: '',
    };
  };

  renderEdit = () => {
    return (
      <div>
        <AppBar><AppBarSection><AppBarTitle>Edit Robin Integration</AppBarTitle></AppBarSection></AppBar>

        <div className="integrations-update">
          <FormLabel
            label="Robin API Token"
            htmlFor="integrations-update-token"
            input={<InputBox
              type="text"
              id="integrations-update-token"
              width="100%"
              value={this.state.robinAccessToken}
              onChange={e => this.setState({robinAccessToken: e.target.value})}
            />}
          />
          <FormLabel
            label="Robin Organization ID"
            htmlFor="integrations-update-organization-id"
            input={<InputBox
              type="text"
              width="100%"
              id="integrations-update-organization-id"
              value={this.state.robinOrganizationId}
              onChange={e => this.setState({robinOrganizationId: e.target.value})}
            />}
          />
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <CancelLink onClick={this.props.onDismiss} />
              <Button
                type="primary"
                disabled={this.state.robinOrganizationId === 0}
                width="100%"
                onClick={() => this.props.onSubmit({
                  id: this.props.initialServiceAuthorization.id,
                  credentials: {
                    robinAccessToken: this.state.robinAccessToken,
                    robinOrganizationId: this.state.robinOrganizationId,  
                  },
                  default: this.state.default,
                })}
              >Save Changes</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    );
  }
  renderDestroy = () => {
    return (
      <div>
        <AppBar><AppBarSection><AppBarTitle>Destroy Integration</AppBarTitle></AppBarSection></AppBar>

        <div className="integrations-update">
          <h2 className="integrations-update-destroy-warning">Are you ABSOLUTELY sure?</h2>

          <p>
            The act of removing an integration is irreversible and could affect certain integrations
            on your dashboard. Type in the name of the Robin Organization ID below
            ("{this.state.robinOrganizationId}") to remove.
          </p>

          <div className="integrations-update-destroy-confirmation">
            <InputBox
              type="text"
              width="100%"
              value={this.props.destroyRobinOrganizationIdConfirmation}
              placeholder="Robin Organization ID"
              onChange={e => this.setState({destroyRobinOrganizationIdConfirmation: e.target.value})}
            />
          </div>
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <CancelLink onClick={this.props.onDismiss} />
              <Button
                type="primary"
                width="100%"
                disabled={this.state.robinOrganizationId !== this.state.destroyRobinOrganizationIdConfirmation}
                onClick={() => this.props.onDestroyServiceAuthorizationRobin(this.props.initialServiceAuthorization.id)}
              >I understand the consequences. Delete.</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    );
  }

  render() {
    const { visible, isDestroying, onDismiss } = this.props;

    let contents;
    if (isDestroying) {
      contents = this.renderDestroy();
    } else {
      contents = this.renderEdit();
    }

    return (
      <Modal
        visible={visible}
        width={480}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        {contents}
      </Modal>
    );
  }
}
