import React from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

const ListViewContext = React.createContext([] as any);

export default function ListView({
  data = [] as any[],
  keyTemplate = item => item.id,
  children = null as any,
}) {
  return <ListViewContext.Provider value={{data, keyTemplate}}>
    <div className="list-view">
      {children}
    </div>
  </ListViewContext.Provider>;
}

export function ListViewColumn({
  title = null as any,
  template = null as any,
  onClick = null as any,
  disabled = item => false,
  style = {} as Object,
}) {
  return <ListViewContext.Consumer>{context => (
    <div className="list-view-column" style={style}>
      <div className="list-view-header">{title}</div>
      {context.data.map(item => {
        const clickable = !disabled(item) && !!onClick;
        return <div
          key={context.keyTemplate(item)}
          className={classnames('list-view-cell', { clickable })}
          onClick={() => clickable && onClick(item)}
        >
          {template && template(item)}
        </div>;
      })}
    </div>
  )}</ListViewContext.Consumer>;
}

// Convenience export for rendering "standard" list clickable text
export const LIST_CLICKABLE_STYLE = {
  textDecoration: 'underline',
  fontWeight: 500,
  color: colorVariables.brandPrimary
};
