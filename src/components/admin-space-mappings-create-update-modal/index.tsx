import styles from './styles.module.scss';

import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
  ButtonGroup,
  RadioButton,
  Modal,
  InputBox,
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
              <ButtonGroup>
                <Button variant="underline" onClick={this.props.onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={this.state.serviceSpaceId === null}
                  onClick={() => this.props.onSubmit({
                    serviceSpaceId: this.state.serviceSpaceId,
                    spaceId: this.props.space.id,
                    serviceId: this.props.service.id,
                  })}
                >Save</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
