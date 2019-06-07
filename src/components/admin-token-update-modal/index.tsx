import styles from './styles.module.scss';

import React, { Fragment } from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
  Button,
  ButtonGroup,
  InputBox,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

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
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Edit Token</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.tokenUpdateModalBody}>
          <FormLabel
            label="Token name"
            htmlFor="token-update-name"
            input={<InputBox
              type="text"
              id="update-token-name"
              value={this.state.name}
              onChange={e => this.setState({name: e.target.value})}
              width="100%"
            />}
          />
          <FormLabel
            label="Description"
            htmlFor="token-update-description"
            input={<InputBox
              type="textarea"
              className={styles.tokenUpdateDescriptionField}
              id="token-update-description"
              value={this.state.description}
              onChange={e => this.setState({description: e.target.value})}
            />}
          />
          <FormLabel
            label="Permissions"
            htmlFor="token-update-permissions"
            input={<span>To update permissions you must create a new token.</span>}
          />
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={this.props.onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={this.state.name.length === 0}
                  width="100%"
                  onClick={() => this.props.onSubmit({
                    key: this.state.key,
                    name: this.state.name,
                    description: this.state.description || undefined,
                  })}
                >Save changes</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  }
  renderDestroy = () => {
    return (
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Destroy Token</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.tokenUpdateModalBody}>
          <h2 className={styles.tokenUpdateDestroyWarning}>Are you ABSOLUTELY sure?</h2>

          <p>
            The act of removing a token is irreversible and generating a duplicate token (with the
            same value) is impossible. Type in the name of this token below
            ("{this.state.name}") to remove.
          </p>

          <div className={styles.tokenUpdateDestroyConfirmation}>
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
              <ButtonGroup>
                <Button variant="underline" onClick={this.props.onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  width="100%"
                  disabled={this.state.name !== this.state.destroyNameConfirmation}
                  onClick={() => this.props.onDestroyToken(this.props.initialToken)}
                >I understand the consequences. Delete.</Button>
              </ButtonGroup>
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
