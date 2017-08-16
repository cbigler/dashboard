import * as React from 'react';
import Modal from '@density/ui-modal';
import Card, { CardHeader, CardLoading, CardBody } from '@density/ui-card';
import Button from '@density/ui-button';
import InputBox from '@density/ui-input-box';
import ModalHeaderActionButton from '../modal-header-action-button/index';
import FormLabel from '../form-label/index';

export default class WebhookUpdateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.initialWebhook.name || '',
      description: this.props.initialWebhook.description || '',
      key: this.props.initialWebhook.key || '',

      isDestroying: false,
    };
  }

  renderEdit() {
    return <div className="webhook-update-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <CardHeader>
            Edit Webhook

            {/* Edit button in the header */}
            <ModalHeaderActionButton
              className="webhook-update-destroy-link"
              onClick={() => this.setState({isDestroying: true})}
            >
              Destroy
            </ModalHeaderActionButton>
          </CardHeader>
          <CardBody>
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
                type="text"
                id="update-webhook-description"
                value={this.state.description}
                onChange={e => this.setState({description: e.target.value})}
              />}
            />

            {this.props.error ? <span>Error: {this.props.error}</span> : null}

            <Button
              className="webhook-update-modal-submit"
              disabled={this.state.name.length === 0}
              onClick={() => this.props.onSubmit({
                id: this.props.initialWebhook.id,
                name: this.state.name,
                description: this.state.description,
                key: this.state.key,
              })}
            >Save</Button>
          </CardBody>
        </Card>
      </Modal>
    </div>;
  }
  renderDestroy() {
    return <div className="webhook-update-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <CardHeader>
            Destroy Webhook

            {/* Edit button in the header */}
            <ModalHeaderActionButton onClick={() => this.setState({isDestroying: false})}>
              Go back to safety
            </ModalHeaderActionButton>
          </CardHeader>
          <CardBody>
            <p>
              Removing a webhook means that the thing receiving the webhook will stop receiving
              events. This operation is reversable though unlike deleting a token - just create a
              webhook with the same contents.
            </p>

            {this.props.error ? <span>Error: {this.props.error}</span> : null}

            <Button
              className="webhook-update-modal-destroy-submit"
              onClick={() => this.props.onDestroyWebhook(this.props.initialWebhook)}
            >Destroy Webhook</Button>
          </CardBody>
        </Card>
      </Modal>
    </div>;
  }

  render() {
    if (this.state.isDestroying) {
      return this.renderDestroy.apply(this);
    } else {
      return this.renderEdit.apply(this);
    }
  }
}
