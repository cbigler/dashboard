import React, { ReactNode } from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

const ListViewContext = React.createContext([] as any);

export default function ListView({
  data = [] as any[],
  keyTemplate = item => item.id,
  showHeaders = true,
  children = null as any,
}) {
  return <ListViewContext.Provider value={{data, keyTemplate, showHeaders}}>
    <div className={styles.listView}>
      {children}
    </div>
  </ListViewContext.Provider>;
}

type ListViewColumnProps = {
  title?: any,
  template?: any,
  onClick?: (any) => any,
  href?: (any) => string,
  disabled?: (any) => boolean,
  flexGrow?: number,
  flexShrink?: number,
  width?: string | number,
}

export function ListViewColumn({
  title = null as any,
  template = null as any,
  onClick = null as any,
  href = null as any,
  disabled = item => false,

  flexGrow = undefined,
  flexShrink = undefined,
  width = 'auto',
}: ListViewColumnProps) {
  return <ListViewContext.Consumer>{context => (
    <div className={styles.listViewColumn} style={{flexGrow, flexShrink, width}}>
      {context.showHeaders ? <div className={styles.listViewHeader}>{title}</div> : null}
      {context.data.map(item => {
        const key = context.keyTemplate(item);
        const clickable = !disabled(item) && Boolean(onClick);
        const result = (
          <div
            key={key}
            className={classnames(styles.listViewCell, { [styles.clickable]: clickable })}
            onClick={() => clickable && onClick(item)}
          >
            {template && template(item)}
          </div>
        );

        if (href) {
          return (
            <a key={key} href={href(item)}>{result}</a>
          );
        } else {
          return result;
        }
      })}
    </div>
  )}</ListViewContext.Consumer>;
}


type ListViewClickableLinkProps = {
  onClick?: () => any,
  children: ReactNode
}

export function ListViewClickableLink({ onClick, children }: ListViewClickableLinkProps) {
  return (
    <span role="button" className={styles.listViewClickableLink} onClick={onClick}>
      {children}
    </span>
  );
}
