import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  InputBox,
  AppBar,
  AppBarContext,
  AppBarTitle,
  AppBarSection,
  Modal,
} from '@density/ui';

export default class ExploreSetCapacityModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      capacity: this.props.space.capacity,
      capacityText: null,
    };
  }
  render() {
    const { space, visible, onDismiss } = this.props;
    return (
      <Modal
        visible={visible}
        width={460}
        height={250}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <AppBar>
          <AppBarTitle>Set capacity: {space.name}</AppBarTitle>
        </AppBar>
        <div className={styles.exploreSetCapacityModalCapacityInput}>
          <InputBox
            type="number"
            value={this.state.capacityText !== null ? this.state.capacityText : (this.state.capacity || '')}
            onChange={e => {
              if (e.target.value === '') {
                this.setState({capacity: null, capacityText: ''});
                return
              }

              let parsed: any = parseInt(e.target.value, 10);
              if (parsed < 0) {
                parsed = null;
              }

              this.setState({
                capacity: isNaN(parsed) ? this.state.capacity : parsed,
                capacityText: e.target.value,
              });
            }}
            placeholder="Capacity"
          />
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <Button
                type="primary"
                variant="filled"
                width="100%"
                disabled={this.state.capacity === null}
                onClick={() => this.props.onSubmit(this.state.capacity)}
              >Save changes</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  }
}
