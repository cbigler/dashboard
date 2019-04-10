import React from 'react';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  InputBox,
} from '@density/ui';

export default function Module({title, actions=null, children}) {
  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <AppBarContext.Provider value="ADMIN_LOCATIONS_EDIT_MODULE_HEADER">
          <AppBar>
            <AppBarTitle>{title}</AppBarTitle>
            {actions}
          </AppBar>
        </AppBarContext.Provider>
      </div>
      <div className={styles.moduleBody}>
        {children}
      </div>
    </div>
  );
}


export function SpaceFieldRenderer({space, displayedFields, state, onChangeField}) {
  // split array into pairs: https://stackoverflow.com/a/44996257/4115328
  const pairs = displayedFields.reduce((acc, item, index) => {
    if (index % 2 === 0) {
      return [ ...acc, displayedFields.slice(index, index+2) ];
    }
    return acc;
  }, []);

  return (
    <div className={styles.spaceFieldRenderer}>
      {pairs.map(([field1, field2]) => {
        const field1Id = `admin-locations-field-${field1.id}`;
        const field2Id = field2 ? `admin-locations-field-${field2.id}` : '';
        return (
          <div className={styles.spaceFieldRendererRow} key={`${field1Id}-${field2Id}`}>
            <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
              <FormLabel
                label={field1.label}
                htmlFor={field1Id}
                input={field1.component(field1Id, state[field1.id], value => onChangeField(field1.id, value))}
              />
            </div>
            {/* if an odd number of `displayedFields` are provided, the final row won't have a second field */}
            {field2 ? (
              <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
                <FormLabel
                  label={field2.label}
                  htmlFor={field2Id}
                  input={field2.component(field2Id, state[field2.id], value => onChangeField(field2.id, value))}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
