import styles from './styles.module.scss';

import React from 'react';
import classnames from 'classnames';

export default class ExploreFilterBar extends React.PureComponent {
  tracker: any;
  filterBar: any;

  // state = {
  //   isFixed: false,
  // }

  // componentDidMount() {
  //   window.addEventListener('scroll', this.onScroll);
  // }
  // componentWillUnmount() {
  //   window.removeEventListener('scroll', this.onScroll);
  // }

  // onScroll = () => {
  //   const position = this.tracker.getBoundingClientRect();
  //   const breakPoint = gridVariables.screenSmMin > window.innerWidth ? navbarHeight : 0;
  //   const isFixed = position.y < breakPoint;
  //   if (this.state.isFixed !== isFixed) {
  //     this.setState({isFixed});
  //   }
  // }

  render() {
    const { children } = this.props;
    const { isFixed } = { isFixed: false }; //this.state;


    const bar = (
      <ul className={styles.exploreFilterBarItems}>
        {children}
      </ul>
    );

    return <div>
      <div className={styles.exploreFilterBarTracker} ref={r => { this.tracker = r; }} />

      <div
        className={classnames(styles.exploreFilterBar, {[styles.fixed]: isFixed})}
        ref={r => { this.filterBar = r; }}
      >{bar}</div>

      {/*
      Render a second filter bar when fixed to replace the old one that became fixed. This is
      done so that the scroll position won't "jump" when the height of the old filter bar is
      removed.
      */}
      {isFixed ? <div
        className={styles.exploreFilterBarHeightSpacer}
        style={{height: this.filterBar.getBoundingClientRect().height}}
      /> : null}
    </div>;
  }
}

interface ExploreFilterBarItemProps {
  right?: JSX.Element,
  label: string,
  children: any
}

export const ExploreFilterBarItem = React.memo(function ExploreFilterBarItem({
  label,
  right,
  children
}: ExploreFilterBarItemProps) {
  return <li className={classnames(styles.exploreFilterBarItem, {[styles.right]: right})}>
    <label className={styles.exploreFilterBarItemLabel}>{label}</label>
    {children}
  </li>;
});
