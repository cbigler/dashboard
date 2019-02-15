import * as React from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  InputBox,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label/index';

export default class WebhookCreateModal extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      endpoint: '',
    };
  }
  render() {
    return <Modal onClose={this.props.onDismiss} onClickBackdrop={this.props.onDismiss}>
      <div className="webhook-create">
        <Card type="modal">
          {this.props.loading ? <CardLoading indeterminate /> : null}

          <CardHeader>Create webhook</CardHeader>

          <CardBody>
            <FormLabel
              className="webhook-create-name-container"
              htmlFor="webhook-create-name"
              label="Webhook name"
              input={<InputBox
                type="text"
                id="webhook-create-name"
                value={this.state.name}
                onChange={e => this.setState({name: e.target.value})}
              />}
            />
            <FormLabel
              className="webhook-create-description-container"
              htmlFor="webhook-create-desc"
              label="Webhook description"
              input={<InputBox
                type="textarea"
                id="webhook-create-desc"
                value={this.state.description}
                onChange={e => this.setState({description: e.target.value})}
              />}
            />
            <FormLabel
              className="webhook-create-endpoint-container"
              htmlFor="webhook-create-endpoint"
              label="Webhook URL"
              input={<InputBox
                type="text"
                id="webhook-create-endpoint"
                value={this.state.endpoint}
                onChange={e => this.setState({endpoint: e.target.value})}
              />}
            />

            <div className="webhook-create-example">
              <p>Webhooks will be sent as POST requests to the url specified above as JSON.</p>
              <p>
                Here's an example webhook payload:
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="http://docs.density.io/#webhooks-receiving"
                >More information</a>
              </p>
              <pre className="webhook-create-example-payload">{
                JSON.stringify({
                  "space_id": "spc_12284369797403919085",
                  "doorway_id": "drw_16131794227371328677",
                  "direction": 1,
                  "count": 32
                }, null, 2)
              }</pre>
            </div>

            <div className="webhook-create-modal-submit">
              <Button
                disabled={this.state.endpoint.length === 0}
                onClick={() => this.props.onSubmit({
                  name: this.state.name,
                  desc: this.state.desc,
                  endpoint: this.state.endpoint,
                })}
              >Submit</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Modal>;
  }
}
