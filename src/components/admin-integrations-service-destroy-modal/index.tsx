import styles from './styles.module.scss';

import React from 'react';

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


export default class IntegrationsServiceDestroyModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {      
      destroyConfirmationText: '',
    };
  };

  render() {
    const { visible, onDismiss, onDestroyServiceAuthorization } = this.props;
      
    return (
      <Modal
        visible={visible}
        width={480}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <div>
          <AppBar><AppBarSection><AppBarTitle>Destroy Integration</AppBarTitle></AppBarSection></AppBar>

          <div className={styles.integrationsUpdate}>
            <h2 className={styles.integrationsUpdateDestroyWarning}>Are you ABSOLUTELY sure?</h2>

            <p>
              The act of removing an integration is irreversible and could affect certain integrations
              on your dashboard. Please type DELETE below to remove.
            </p>

            <div className={styles.integrationsUpdateDestroyConfirmation}>
              <InputBox
                type="text"
                width="100%"
                value={this.props.destroyConfirmationText}
                placeholder=""
                onChange={e => this.setState({destroyConfirmationText: e.target.value})}
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
                    disabled={"DELETE" !== this.state.destroyConfirmationText}
                    onClick={() => this.props.onDestroyServiceAuthorization(this.props.initialServiceAuthorization.id)}
                  >I understand the consequences. Delete.</Button>
                </ButtonGroup>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    );
  }
}
