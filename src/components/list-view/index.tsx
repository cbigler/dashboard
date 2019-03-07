import React from 'react';
import classnames from 'classnames';

const ListViewContext = React.createContext([] as any);

export default function ListView({
  data = [] as any[],
  children = null as any,
}) {
  return <ListViewContext.Provider value={data}>
    <div className="list-view">
      {children}
    </div>
  </ListViewContext.Provider>;
}

export function ListViewColumn({
  title = null as any,
  template = null as any,
  onClick = null as any,
  disabled = (any) => false,
  style = {} as Object,
}) {
  return <ListViewContext.Consumer>{data => (
    <div className="list-view-column" style={style}>
      <div className="list-view-header">{title}</div>
      {data.map(item => {
        const clickable = !disabled(item) && !!onClick;
        return <div
          key={item.id}
          className={classnames('list-view-cell', { clickable })}
          onClick={() => clickable && onClick(item)}
        >
          {template && template(item)}
        </div>;
      })}
    </div>
  )}</ListViewContext.Consumer>;
}
