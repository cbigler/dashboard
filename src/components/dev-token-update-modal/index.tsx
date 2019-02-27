import * as React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  InputBox,
  Modal,
} from '@density/ui';

import ModalHeaderActionButton from '../modal-header-action-button/index';
import FormLabel from '../form-label/index';

export default class TokenUpdateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.initialToken.name || '',
      description: this.props.initialToken.description || '',
      key: this.props.initialToken.key || '',

      isDestroying: false,
      destroyNameConfirmation: '',
    };
  }

  renderEdit() {
    return <div className="token-update-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}

          <CardHeader>
            Edit Token

            {/* Edit button in the header */}
            <ModalHeaderActionButton
              className="token-update-destroy-link"
              onClick={() => this.setState({isDestroying: true})}
            >
              Destroy
            </ModalHeaderActionButton>
          </CardHeader>
          <CardBody>
            <FormLabel
              className="update-token-name-container"
              label="Token Name"
              htmlFor="update-token-name"
              input={<InputBox
                type="text"
                id="update-token-name"
                value={this.state.name}
                onChange={e => this.setState({name: e.target.value})}
                width="100%"
              />}
            />
            <FormLabel
              className="update-token-description-container"
              label="Description"
              htmlFor="update-token-description"
              input={<InputBox
                type="textarea"
                className="token-update-description-field"
                id="token-update-description"
                value={this.state.description}
                onChange={e => this.setState({description: e.target.value})}
              />}
            />
            <FormLabel
              className="update-token-permissions-container"
              label="Permissions"
              htmlFor="update-token-permissions"
              input={<span>To update permissions you must create a new token.</span>}
            />

            <div className="token-update-modal-submit">
              <Button
                disabled={this.state.name.length === 0}
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  description: this.state.description,
                  key: this.state.key,
                })}
              >Save Changes</Button>
            </div>
          </CardBody>
        </Card>
      </Modal>
    </div>;
  }
  renderDestroy() {
    return <div className="token-update-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <CardHeader>
            Destroy Token

            {/* Edit button in the header */}
            <ModalHeaderActionButton onClick={() => this.setState({isDestroying: false})} className={null}>
              Go back to safety
            </ModalHeaderActionButton>
          </CardHeader>
          <CardBody>
            <h2 className="token-update-destroy-warning">Are you ABSOLUTELY sure?</h2>

            <p>
              The act of removing a token is irreversible - ie, you might have the token built into
              a piece of software such that it would be difficult to reassign. Type in the name of
              this token below (<code>{this.state.name}</code>) to remove.
            </p>

            <div className="token-update-destroy-confirmation">
              <InputBox
                type="text"
                value={this.state.destroyNameConfirmation}
                placeholder="Token Name"
                onChange={e => this.setState({destroyNameConfirmation: e.target.value})}
              />
            </div>

            <div className="token-update-destroy-submit">
              <Button
                disabled={this.state.name !== this.state.destroyNameConfirmation}
                onClick={() => this.props.onDestroyToken(this.props.initialToken)}
              >I understand the consequences. Delete.</Button>
            </div>
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
