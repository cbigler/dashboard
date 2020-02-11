import React, { useState } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import { AppBar, AppBarSection, Icons } from '@density/ui/src';

export default function AdminLocationsSubheader({title, subtitle=null, space_id=null, supportsHover=true}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      className={classnames(styles.subheader, {
        [styles.hover]: supportsHover && hover,
        [styles.supportsHover]: supportsHover,
      })}
      href={space_id ? `#/admin/locations/${space_id}` : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AppBar>
        <AppBarSection>
          <span
            className={classnames(styles.title, {[styles.hover]: supportsHover && hover})}
          >
            {title}
          </span>
          {subtitle ? <span 
            className={classnames(styles.subtitle, {[styles.hover]: supportsHover && hover})}
          >{subtitle}</span> : null}
        </AppBarSection>
        {supportsHover ? (
          <AppBarSection>
            <span className={styles.manageLinkWrapper}>
              <span className={classnames(styles.manageLink, {[styles.hover]: hover})}>Manage</span>
              <Icons.ArrowRight
                color={hover ? colorVariables.midnight : colorVariables.gray400}
                width={17}
                height={17}
              />
            </span>
          </AppBarSection>
        ) : null}
      </AppBar>
    </a>
  );
}
