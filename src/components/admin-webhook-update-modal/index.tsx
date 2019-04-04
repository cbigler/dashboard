import styles from './styles.module.scss';

import React, { Fragment } from 'react';

import {
  Button,
  ButtonContext,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
} from '@density/ui';

import FormLabel from '../form-label';
import Modal from '../modal';

export default class WebhookUpdateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.initialWebhook.id || '',
      name: this.props.initialWebhook.name || '',
      description: this.props.initialWebhook.description || '',
    };
  }

  renderEdit = () => {
    return (
      <Fragment>
        <AppBar>
          <AppBarSection>
            <AppBarTitle>Edit Webhook</AppBarTitle>
          </AppBarSection>
        </AppBar>
        <div className={styles.webhookUpdateModalBody}>
          <FormLabel
            htmlFor="webhook-update-name"
            label="Webhook Name"
            input={<InputBox
              type="text"
              id="webhook-update-name"
              value={this.state.name}
              onChange={e => this.setState({name: e.target.value})}
            />}
          />
          <FormLabel
            htmlFor="webhook-update-description"
            label="Description"
            input={<InputBox
              type="textarea"
              id="webhook-update-description"
              value={this.state.description}
              onChange={e => this.setState({description: e.target.value})}
            />}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonContext.Provider value="CANCEL_BUTTON">
                <Button onClick={this.props.onDismiss}>Cancel</Button>
              </ButtonContext.Provider>
              <Button
                type="primary"
                width="100%"
                disabled={this.state.name.length === 0}
                onClick={() => this.props.onSubmit({
                  id: this.state.id,
                  name: this.state.name,
                  description: this.state.description,
                })}
              >Save Webhook</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  }
  renderDestroy = () => {
    return (
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Destroy Webhook</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.webhookUpdateModalBody}>
          <p>
            Please confirm you'd like to destroy the webhook "{this.props.initialWebhook.name}".
          </p>
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonContext.Provider value="CANCEL_BUTTON">
                <Button onClick={this.props.onDismiss}>Cancel</Button>
              </ButtonContext.Provider>
              <Button
                type="primary"
                onClick={() => this.props.onDestroyWebhook(this.props.initialWebhook)}
              >Destroy Webhook</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
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