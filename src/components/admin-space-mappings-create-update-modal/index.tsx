import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  ButtonContext,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  RadioButton,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';
import AdminServiceSpaceRadioList from '../admin-service-space-radio-list/index';

export default class SpaceMappingsCreateUpdateModal extends React.Component<any, any> {
  constructor(props){
    super(props);
    this.state = {
      serviceSpaceId: this.props.initialServiceSpaceId,
    };
  }

  render() {

    return (
      <Modal
        visible={this.props.visible}
        width={460}
        height={527}
        onBlur={this.props.onDismiss}
        onEscape={this.props.onDismiss}
      >
        <AppBar>
          <AppBarTitle>Connect with {this.props.space.name}...</AppBarTitle>
        </AppBar>
        <div className={styles.spaceMappingsWrapper}>
          <AdminServiceSpaceRadioList
            serviceSpaces={this.props.serviceSpaces}
            value={this.state.serviceSpaceId}
            onChange={serviceSpaceId => {
              this.setState({
                serviceSpaceId: serviceSpaceId
              })
            }}
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
                disabled={this.state.serviceSpaceId === null}
                width="100%"
                onClick={() => this.props.onSubmit({
                  serviceSpaceId: this.state.serviceSpaceId,
                  spaceId: this.props.space.id,
                  serviceId: this.props.service.id,
                })}
              >Save</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
