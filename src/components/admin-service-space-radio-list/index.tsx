import styles from './styles.module.scss';

import React, { Component, Fragment } from 'react';

import { DensityServiceSpace } from '../../types';
import { RadioButton, RadioButtonContext, InputBox, Icons } from '@density/ui/src';
import filterCollection from '../../helpers/filter-collection/index';


export default class AdminServiceSpaceRadioList extends Component<any, any> {
  state = {
    filterText: '',
    serviceSpaces: this.props.serviceSpaces as Array<DensityServiceSpace>,
  }

  render() {
    const nameFilter = filterCollection({fields: ['name']});

    return (
      <Fragment>
        <InputBox
          width="100%"
          type="text"
          leftIcon={<Icons.Search />}
          placeholder="Search by name"
          value={this.state.filterText}
          onChange={e => {
            const filteredServiceSpaces = nameFilter(this.props.serviceSpaces, e.target.value);
            this.setState({
              serviceSpaces: filteredServiceSpaces,
              filterText: e.target.value,
            })
          }}
        />
        <div className={styles.serviceSpaceRadioSection}>
          {this.state.serviceSpaces.map(serviceSpace => (
            <div key={serviceSpace.name} className={styles.serviceSpaceRadioButton}>
              <RadioButtonContext.Provider value='SERVICE_SPACE_FORM'>
                <RadioButton
                  name="admin-service-space"
                  checked={this.props.value === serviceSpace.service_space_id}
                  onChange={e => {
                    this.props.onChange(serviceSpace.service_space_id)
                  }}
                  value={serviceSpace.service_space_id}
                  text={serviceSpace.name} />
              </RadioButtonContext.Provider>
            </div>
          ))}
        </div>
      </Fragment>
    )
  }
}