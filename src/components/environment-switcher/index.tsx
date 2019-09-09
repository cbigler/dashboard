import React from 'react';
import FormLabel from '../form-label/index';

import styles from './styles.module.scss';

import {
  AppBar,
  AppBarTitle,
  Button,
  InputBox,
  Switch,
  Modal,
} from '@density/ui';

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

// Is the dashboard configured to "go slow" (special query parameter for event queries)?
export function getGoSlow() {
  return window.localStorage.environmentGoSlow ? JSON.parse(window.localStorage.environmentGoSlow) : false;
}

export default class EnvironmentSwitcher extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      values: getActiveEnvironments(props.fields),
      goSlow: getGoSlow(),
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
    this.props.onChange();
  }
  render() {
    const { fields } = this.props;
    return <div>

      {/* if the url of what the user is looking at is staging, show a banner saying that */}
      {(
        Object.keys(this.state.values)
          .map(i => this.state.values[i])
          .filter(i => i.indexOf('staging') >= 0).length > 0
      ) ? <div className={styles.environmentSwitcherNonProductionRelease}>
        Staging
      </div> : null}

      {/* if the url of what the user is looking at is localhost, show a banner saying that */}
      {(
        Object.keys(this.state.values)
          .map(i => this.state.values[i])
          .filter(i => (
            i.indexOf('localhost') >= 0 ||
            i.indexOf('127.0.0.1') >= 0 ||
            /192\.168\.[0-9]+\.[0-9]+/.test(i) ||
            /10\.[0-9]\.[0-9]+\.[0-9]+/.test(i)
          )).length > 0
      ) ? <div className={styles.environmentSwitcherNonProductionRelease}>
        Local
      </div> : null}

    {this.state.open ? <Modal
        width="480px"
        onBlur={() => this.setState({open: false})}
        onEscape={() => this.setState({open: false})}
        visible={true}
      >
        <AppBar><AppBarTitle>Choose Environment</AppBarTitle></AppBar>
        <div className={styles.environmentSwitcherContent}>
          <p>
            This is the Density Environment Switcher. Use it to point this dashboard instance to
            arbitrary microservices for development. If you opened this by mistake, close this
            popup to return to the Density Dashboard.
          </p>
          <br /><br />
          <ul className={styles.environmentSwitcherItems}>
            {fields.map(field => {
              return <FormLabel
                className={styles.environmentSwitcherItem}
                label={field.name}
                htmlFor={`environment-switcher-${field.slug}`}
                key={field.slug}
                input={<InputBox
                  type="select"
                  width="100%"
                  value={this.state.values[field.slug] || field.defaults[field.default]}
                  onChange={e => this.setState({values: {...this.state.values, [field.slug]: e.id}})}
                  className={styles.environmentSwitcherInput}
                  choices={Object.keys(field.defaults).map(f => ({
                    id: field.defaults[f] || '(undefined)',
                    disabled: typeof field.defaults[f] === 'undefined',
                    label: `${f} (${field.defaults[f]})`,
                  }))}
                />}
              />
            })}
            <FormLabel
              className={styles.environmentSwitcherItem}
              label="Use legacy 'slow' query for space counts"
              htmlFor="environment-switcher-go-slow"
              key="goSlow"
              input={<Switch
                  value={this.state.goSlow}
                  onChange={e => this.setState({goSlow: !this.state.goSlow})}
                />}
            />
          </ul>

          <div className={styles.environmentSwitcherFooter}>
            <Button
              variant="filled"
              width="100%"
              className={styles.environmentSwitcherButton}
              onClick={() => {
                this.setState({open: false});
                window.localStorage.environmentSwitcher = JSON.stringify(this.state.values);
                window.localStorage.environmentGoSlow = JSON.stringify(this.state.goSlow);
                this.props.onChange();
              }}
            >OK</Button>
          </div>
        </div>
      </Modal> : null}
    </div>;
  }
}
