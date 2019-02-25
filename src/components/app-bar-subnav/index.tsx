import React from 'react';
import classnames from 'classnames';

export function AppBarSubnavLink({
  href,
  active,
  children
}) {
  return <a 
    href={href}
    className={classnames('app-bar-subnav-link', {
      'selected': active
    })}
  >
    {children}
  </a>;
}

export default function AppBarSubnav({children}) {
  return <div className="app-bar-subnav">
    {children}
  </div>;
}
