import React from 'react';

import {
  Button,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
} from '@density/ui';

import ModalHeaderActionButton from '../modal-header-action-button/index';
import FormLabel from '../form-label/index';
import Modal from '../modal/index';

export default class WebhookUpdateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.initialWebhook.name || '',
      description: this.props.initialWebhook.description || '',
      key: this.props.initialWebhook.key || '',

      isDestroying: false,
    };
  }

  renderEdit = () => {
    return (
      <div className="webhook-update-modal">
        <AppBar>
          <AppBarTitle>Edit Webhook</AppBarTitle>
          <AppBarSection>
            <ModalHeaderActionButton
              className="webhook-update-destroy-link"
              onClick={() => this.setState({isDestroying: true})}
            >
              Destroy
            </ModalHeaderActionButton>
          </AppBarSection>
        </AppBar>
        <div className="webhook-update-modal-body">
          <FormLabel
            className="webhook-update-name-container"
            htmlFor="update-webhook-name"
            label="Webhook Name"
            input={<InputBox
              type="text"
              id="update-webhook-name"
              value={this.state.name}
              onChange={e => this.setState({name: e.target.value})}
            />}
          />
          <FormLabel
            className="webhook-update-description-container"
            htmlFor="update-webhook-description"
            label="Description"
            input={<InputBox
              type="textarea"
              id="update-webhook-description"
              value={this.state.description}
              onChange={e => this.setState({description: e.target.value})}
            />}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <Button
                type="primary"
                width="100%"
                disabled={this.state.name.length === 0}
                onClick={() => this.props.onSubmit({
                  id: this.props.initialWebhook.id,
                  name: this.state.name,
                  description: this.state.description,
                  key: this.state.key,
                })}
              >Save Webhook</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    );
  }
  renderDestroy = () => {
    return (
      <div className="webhook-update-modal">
        <AppBar>
          <AppBarTitle>
            Destroy Webhook
          </AppBarTitle>
          <AppBarSection>
            <ModalHeaderActionButton onClick={() => this.setState({isDestroying: false})} className={null}>
              Go back to safety
            </ModalHeaderActionButton>
          </AppBarSection>
        </AppBar>

        <div className="webhook-update-modal-body">
          <p>
            Please confirm you'd like to destroy the webhook {this.props.initialWebhook.name}.
          </p>
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <Button
                type="primary"
                onClick={() => this.props.onDestroyWebhook(this.props.initialWebhook)}
              >Destroy Webhook</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    );
  }

  render() {
    const { visible, onDismiss } = this.props;

    let contents;
    if (this.state.isDestroying) {
      contents = this.renderDestroy();
    } else {
      contents = this.renderEdit();
    }

    return (
      <Modal
        visible={visible}
        width={460}
        height={386}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        {contents}
      </Modal>
    );
  }
}
