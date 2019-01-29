import React from 'react';
import FormLabel from '../form-label/index';

import InputBox from '@density/ui-input-box';
import Switch from '@density/ui-switch';
import Card, { CardHeader, CardBody } from '@density/ui-card';
import Button from '@density/ui-button';
import Modal from '@density/ui-modal';

// Called initially to get the 
export function getActiveEnvironments(fields) {
  // Get initial environment configuration.
  const values = window.localStorage.environmentSwitcher ? JSON.parse(window.localStorage.environmentSwitcher) : [];

  // Pluck initial values for each environment out of the field values passed in if a value wasn't
  // set in localStorage already.
  const data = {};
  fields.forEach(f => {
    data[f.slug] = values[f.slug] || f.defaults[f.default];
  });
  return data;
}

// Is the dashboard configured to "go fast" (special query parameter for event queries)?
export function getGoFast() {
  return window.localStorage.environmentGoFast ? JSON.parse(window.localStorage.environmentGoFast) : false;
}

export default class EnvironmentSwitcher extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      values: getActiveEnvironments(props.fields),
      goFast: getGoFast(),
      open: false,
    };

    // Listen for a keypress to open the environment switcher.
    const keys = this.props.keys || ['!', '!', '`'];
    let indexInKeys = 0;
    window.addEventListener('keydown', e => {
      if (keys[indexInKeys] === e.key) {
        if (indexInKeys === keys.length - 1) {
          indexInKeys = 0;
          this.setState({open: true});
        }
        indexInKeys++;
      } else {
        // Wasn't the right key, do nothing.
        indexInKeys = 0;
      }
      // Reset after a couple seconds
      setTimeout(() => { indexInKeys = 0; }, 5000);
    });

    // Emit an initial event.
    this.props.onChange(getActiveEnvironments(this.props.fields));
  }
  render() {
    const { fields } = this.props;
    return <div>

      {/* if the url of what the user is looking at is staging, show a banner saying that */}
      {(
        Object.keys(this.state.values)
          .map(i => this.state.values[i])
          .filter(i => i.indexOf('staging') >= 0).length > 0
      ) ? <div className="environment-switcher-non-production-release">
        Staging
      </div> : null}

    {this.state.open ? <Modal
        onClose={() => this.setState({open: false})}
        onClickBackdrop={() => this.setState({open: false})}
      >
        <Card type="modal" className="environment-switcher">
          <CardHeader>Choose Environment</CardHeader>
          <CardBody className="environment-switcher-desc">
            <p>
              This is the Density Environment Switcher. Use it to point this dashboard instance to
              arbitrary microservices for development. If you opened this by mistake, close this
              popup to return to the Density Dashboard.
            </p>
          </CardBody>
          <CardBody>
            <ul className="environment-switcher-items">
              {fields.map(field => {
                return <FormLabel
                  className="environment-switcher-item"
                  label={field.name}
                  htmlFor={`environment-switcher-${field.slug}`}
                  key={field.slug}
                  input={<InputBox
                    type="select"
                    width="100%"
                    value={this.state.values[field.slug] || field.defaults[field.default]}
                    onChange={e => this.setState({values: {...this.state.values, [field.slug]: e.id}})}
                    className="environment-switcher-input"
                    choices={Object.keys(field.defaults).map(f => ({
                      id: field.defaults[f] || '(undefined)',
                      disabled: typeof field.defaults[f] === 'undefined',
                      label: `${f} (${field.defaults[f]})`,
                    }))}
                  />}
                />
              })}
              <FormLabel
                className="environment-switcher-item"
                label="Use experimental fast queries"
                htmlFor="environment-switcher-go-fast"
                key="goFast"
                input={<Switch
                    value={this.state.goFast}
                    onChange={e => this.setState({goFast: !this.state.goFast})}
                  />}
              />
            </ul>

            <div className="environment-switcher-footer">
              <Button className="environment-switcher-button" onClick={() => {
                this.setState({open: false});
                window.localStorage.environmentSwitcher = JSON.stringify(this.state.values);
                window.localStorage.environmentGoFast = JSON.stringify(this.state.goFast);
                this.props.onChange(this.state.values, this.state.goFast)
              }}>OK</Button>
            </div>
          </CardBody>
        </Card>
      </Modal> : null}
    </div>;
  }
}
