import React from 'react';

import {
  Button,
  InputBox,
  AppBar,
  AppBarTitle,
  AppBarContext,
  AppBarSection,
} from '@density/ui';

import FormLabel from '../form-label';
import Modal from '../modal';
import { CancelLink } from '../dialogger';

export default class WebhookCreateModal extends React.Component<any, any> {
  state = {
    name: '',
    description: '',
    endpoint: '',
  }

  render() {
    const { visible, onDismiss } = this.props;
    return (
      <Modal
        visible={visible}
        width={895}
        height={500}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <AppBar>
          <AppBarTitle>Create Webhook</AppBarTitle>
        </AppBar>
        <div className="webhook-create-columns">
          <div className="webhook-create-column left">
            <FormLabel
              className="webhook-create-name-container"
              htmlFor="webhook-create-name"
              label="Webhook name"
              input={<InputBox
                type="text"
                width="100%"
                id="webhook-create-name"
                value={this.state.name}
                onChange={e => this.setState({name: e.target.value})}
              />}
            />
            <FormLabel
              className="webhook-create-description-container"
              htmlFor="webhook-create-desc"
              label="Webhook description"
              input={<InputBox
                type="textarea"
                id="webhook-create-desc"
                value={this.state.description}
                height="5em"
                onChange={e => this.setState({description: e.target.value})}
              />}
            />
            <FormLabel
              className="webhook-create-endpoint-container"
              htmlFor="webhook-create-endpoint"
              label="Webhook URL"
              input={<InputBox
                type="text"
                width="100%"
                leftIcon={<strong>POST</strong>}
                id="webhook-create-endpoint"
                placeholder="(ie, http://example.com)"
                value={this.state.endpoint}
                onChange={e => this.setState({endpoint: e.target.value})}
              />}
            />
          </div>

          <div className="webhook-create-column right">
            <div className="webhook-create-example">
              <p>Webhooks will be sent as POST requests to the URL specified in JSON.</p>
              <p>
                Here's an example webhook payload:
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.density.io/v2/#webhooks-receiving"
                >More information</a>
              </p>
              <pre className="webhook-create-example-payload">{
                JSON.stringify({
                  "space_id": "spc_12284369797403919085",
                  "doorway_id": "drw_16131794227371328677",
                  "direction": 1,
                  "count": 32
                }, null, 2)
              }</pre>
            </div>
          </div>
        </div>
        
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <CancelLink onClick={onDismiss} />
              <Button
                type="primary"
                disabled={this.state.endpoint.length === 0}
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  description: this.state.description,
                  endpoint: this.state.endpoint,
                })}
              >Save Webhook</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
