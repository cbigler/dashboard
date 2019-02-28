import React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  InputBox,
  Modal,
} from '@density/ui';

export default class ExploreEditCountModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      count: this.props.space.currentCount,
      countText: null,
    };
  }
  render() {
    return <div className="explore-edit-count-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}
          <CardHeader>
            Update Count
            <span
              className="explore-edit-count-modal-reset-count"
              onClick={() => this.setState({count: 0})}
            >Reset to zero</span>
          </CardHeader>
          <CardBody>
            <div className="explore-edit-count-modal-count-picker">
              <button
                onClick={() => this.setState({count: Math.max(this.state.count - 1, 0)})}
                disabled={this.state.count <= 0}
                className="explore-edit-count-modal-count-button subtract"
              >&mdash;</button>

              <div className="explore-edit-count-modal-count-picker-label">
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
                className="explore-edit-count-modal-count-button add"
              >+</button>
            </div>

            <div className="explore-edit-count-modal-submit">
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
  }
}
