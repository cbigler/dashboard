import React, { useState } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import { AppBar, AppBarSection, Icons } from '@density/ui';

export default function AdminLocationsSubheader({title, spaceId=null, supportsHover=true}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      className={classnames(styles.subheader, {
        [styles.hover]: supportsHover && hover,
        [styles.supportsHover]: supportsHover,
      })}
      href={spaceId ? `#/admin/locations/${spaceId}` : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AppBar>
        <AppBarSection>
          <span
            className={classnames(styles.title, {[styles.hover]: supportsHover && hover})}
          >{title}</span>
        </AppBarSection>
        {supportsHover ? (
          <AppBarSection>
            <span className={styles.manageLinkWrapper}>
              <span className={classnames(styles.manageLink, {[styles.hover]: hover})}>Manage</span>
              <Icons.ArrowRight color={hover ? colorVariables.brandPrimary : colorVariables.gray} />
            </span>
          </AppBarSection>
        ) : null}
      </AppBar>
    </a>
  );
}
