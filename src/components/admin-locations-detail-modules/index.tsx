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

function Module({title, actions=null, children}) {
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

export function AdminLocationsMetadataModule({space, onChangeField}) {
  return (
    <Module title="Meta">
      <div className={styles.metadata}>
        <div className={styles.metadataRow}>
          <div className={classnames(styles.metadataCell, styles.left)}>
            <FormLabel
              label="Capacity"
              htmlFor="admin-locations-capacity"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-capacity"
                  width="100%"
                  value={space.capacity}
                  onChange={e => onChangeField('capacity', e.target.value)}
                />
              }
            />
          </div>
          <div className={classnames(styles.metadataCell, styles.right)}>
            <FormLabel
              label="Seat Assignments"
              htmlFor="admin-locations-metadata-seat-assignments"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-metadata-seat-assignments"
                  width="100%"
                  defaultValue="foo"
                />
              }
            />
          </div>
        </div>
        <div className={styles.metadataRow}>
          <div className={classnames(styles.metadataCell, styles.left)}>
            <FormLabel
              label="Rent (annual)"
              htmlFor="admin-locations-rent"
              input={
                <InputBox
                  leftIcon={<span>$</span>}
                  type="number"
                  width="100%"
                  defaultValue="foo"
                />
              }
            />
          </div>
        </div>
      </div>
    </Module>
  );
}
