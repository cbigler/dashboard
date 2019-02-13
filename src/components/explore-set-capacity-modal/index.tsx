import * as React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  InputBox,
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
    return <div className="explore-set-capacity-modal">
      <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
        <Card className="explore-set-capacity-modal-card" type="modal">
          <CardHeader className="explore-set-capacity-modal-header">Set Capacity: {this.props.space.name}</CardHeader>
          <CardBody>
            <div className="explore-set-capacity-modal-capacity-input">
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

            <div className="explore-set-capacity-modal-submit">
              <Button
                disabled={this.state.capacity === null}
                onClick={() => this.props.onSubmit(this.state.capacity)}
              >Save changes</Button>
            </div>
          </CardBody>
        </Card>
      </Modal>
    </div>
  }
}
