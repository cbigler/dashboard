import styles from './styles.module.scss';

import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  Modal,
} from '@density/ui/src';

import AdminServiceSpaceRadioList from '../admin-service-space-radio-list/index';

export default class SpaceMappingsCreateUpdateModal extends React.Component<any, any> {
  constructor(props){
    super(props);
    this.state = {
      service_space_id: this.props.initialServiceSpaceId,
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
            value={this.state.service_space_id}
            onChange={service_space_id => {
              this.setState({
                service_space_id: service_space_id
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
                  disabled={this.state.service_space_id === null}
                  onClick={() => this.props.onSubmit({
                    service_space_id: this.state.service_space_id,
                    space_id: this.props.space.id,
                    service_id: this.props.service.id,
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
