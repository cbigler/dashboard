import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  InputBox,
  Icons,
} from '@density/ui';

import Modal from '../modal/index';
import colorVariables from '@density/ui/variables/colors.json';

export default class ExploreEditCountModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.space.currentCount,
      countText: null,
    };
  }
  render() {
    const { visible, onDismiss } = this.props;
    return (
      <div className={styles.exploreEditCountModal}>
        <Modal
          visible={visible}
          width={460}
          height={300}
          onBlur={onDismiss}
          onEscape={onDismiss}
        >
          <Card type="modal">
            {this.props.loading ? <CardLoading indeterminate /> : null}
            <CardHeader>
              Update Count
              <span
                className={styles.exploreEditCountModalResetCount}
                onClick={() => this.setState({count: 0})}
              >Reset to zero</span>
            </CardHeader>
            <CardBody>
              <div className={styles.exploreEditCountModalCountPicker}>
                <button
                  onClick={() => this.setState({count: Math.max(this.state.count - 1, 0)})}
                  disabled={this.state.count <= 0}
                  className={`${styles.exploreEditCountModalCountButton} ${styles.subtract}`}
                >
                  <div>
                    <Icons.Minus color={colorVariables.grayDarker} />
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
                  <Icons.Plus color={colorVariables.grayDarker} />
                </button>
              </div>

              <div className={styles.exploreEditCountModalSubmit}>
                <Button
                  type="primary"
                  width="100%"
                  onClick={() => this.props.onSubmit(this.state.count)}
                >Save Changes</Button>
              </div>
            </CardBody>
          </Card>
        </Modal>
      </div>
    );
  }
}
