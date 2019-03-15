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

export default class TokenUpdateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.initialToken.name || '',
      description: this.props.initialToken.description || '',
      key: this.props.initialToken.key || '',

      destroyNameConfirmation: '',
    };
  }

  renderEdit = () => {
    return (
      <div className="token-update-modal">
        <AppBar><AppBarSection><AppBarTitle>Edit Token</AppBarTitle></AppBarSection></AppBar>

        <div className="token-update-modal-body">
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
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <CancelLink onClick={this.props.onDismiss} />
              <Button
                type="primary"
                disabled={this.state.name.length === 0}
                width="100%"
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  description: this.state.description,
                  key: this.state.key,
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
      <div className="token-update-modal">
        <AppBar><AppBarSection><AppBarTitle>Destroy Token</AppBarTitle></AppBarSection></AppBar>

        <div className="token-update-modal-body">
          <h2 className="token-update-destroy-warning">Are you ABSOLUTELY sure?</h2>

          <p>
            The act of removing a token is irreversible and generating a duplicate token (with the
            same value) is impossible. Type in the name of this token below
            ("{this.state.name}") to remove.
          </p>

          <div className="token-update-destroy-confirmation">
            <InputBox
              type="text"
              width="100%"
              value={this.state.destroyNameConfirmation}
              placeholder="Token Name"
              onChange={e => this.setState({destroyNameConfirmation: e.target.value})}
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
                disabled={this.state.name !== this.state.destroyNameConfirmation}
                onClick={() => this.props.onDestroyToken(this.props.initialToken)}
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
