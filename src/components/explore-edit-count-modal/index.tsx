import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  AppBar,
  AppBarSection,
  AppBarTitle,
  CardLoading,
  Icons,
  Modal,
} from '@density/ui/src';

import colorVariables from '@density/ui/variables/colors.json';

export default class ExploreEditCountModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.space.current_count,
      countText: null,
    };
  }
  render() {
    const { visible, onDismiss } = this.props;
    return (
      <Modal
        visible={visible}
        width={460}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <div className={styles.exploreEditCountModal}>
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Update count</AppBarTitle>
            </AppBarSection>
            <AppBarSection>
              <Button
                variant="underline"
                onClick={() => this.setState({count: 0})}
              >Reset to zero</Button>
            </AppBarSection>
          </AppBar>
          <div className={styles.exploreEditCountModalBody}>
            <div className={styles.exploreEditCountModalCountPicker}>
              <button
                onClick={() => this.setState({count: Math.max(this.state.count - 1, 0)})}
                disabled={this.state.count <= 0}
                className={`${styles.exploreEditCountModalCountButton} ${styles.subtract}`}
              >
                <div style={{width: 24, height: 24, marginTop: 12}}>
                  <Icons.Minus color={colorVariables.gray500} />
                </div>
              </button>

              <div className={styles.exploreEditCountModalCountPickerLabel}>
                <input
                  type="number"
                  value={this.state.countText !== null ? this.state.countText : this.state.count}
                  onChange={e => this.setState({countText: e.target.value})}
                  onBlur={() => {
                    let parsed = parseInt(this.state.countText, 10);
                    if (parsed < 0) {
                      parsed = 0;
                    }

                    this.setState({
                      count: isNaN(parsed) ? this.state.count : parsed,
                      countText: null,
                    });
                  }}
                />
              </div>

              <button
                onClick={() => this.setState({count: this.state.count + 1})}
                className={`${styles.exploreEditCountModalCountButton} ${styles.add}`}
              >
                <div style={{width: 24, height: 24}}>
                  <Icons.Plus color={colorVariables.gray500} />
                </div>
              </button>
            </div>

            <div className={styles.exploreEditCountModalSubmit}>
              <Button
                type="primary"
                variant="filled"
                width="100%"
                onClick={() => this.props.onSubmit(this.state.count)}
              >Save changes</Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
