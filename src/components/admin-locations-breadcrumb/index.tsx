import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { DensitySpace } from '../../types';

import { InputBox, Icons } from '@density/ui';

import filterCollection from '../../helpers/filter-collection/index';

export default function AdminLocationsBreadcrumb({ spaces, space }) {
  if (space) {
    return (
      <div className={styles.breadcrumb}>
        <a href={`#/admin/locations`} className={styles.item}>Locations</a>
        <Icons.ChevronRight width={12} height={12} />

        {space.ancestry.slice().reverse().map((s, index) => {
          return (
            <Fragment key={s.id}>
              <a
                href={`#/admin/locations/${s.id}`}
                key={s.id}
                className={styles.item}
              >{s.name}</a>
              <Icons.ChevronRight width={12} height={12} />
            </Fragment>
          );
        })}

        <span className={styles.item}>
          <BreadcrumbSiblingSelector selectedSpace={space} spaces={spaces}>
            <span className={styles.finalText}>{space.name}</span>
            <Icons.ChevronDown width={12} height={12} />
          </BreadcrumbSiblingSelector>
        </span>
      </div>
    );
  } else {
    return (
      <div className={styles.breadcrumb}>
        <a href="#/admin/locations" className={styles.item}>Locations</a>
      </div>
    );
  }
}

type BreadcrumbSiblingSelectorProps = {
  children: React.ReactNode,
  spaces: {
    view: 'VISIBLE' | 'ERROR' | 'LOADING',
    data: Array<DensitySpace>,
    error: any,
  },
  selectedSpace: DensitySpace,
};

type BreadcrumbSiblingSelectorState = {
  visible: boolean,
  activeItemIndex: number | null,
  filterText: string,
};

const nameFilter = filterCollection({fields: ['name']});

export class BreadcrumbSiblingSelector extends Component<BreadcrumbSiblingSelectorProps, BreadcrumbSiblingSelectorState> {
  state = {
    visible: false,
    activeItemIndex: null,
    filterText: '',
  }

  onShow = () => {
    this.setState({visible: true, activeItemIndex: null, filterText: ''});
  }
  onHide = () => {
    this.setState({visible: false});
  }

  render() {
    const { filterText, activeItemIndex, visible } = this.state;
    const { selectedSpace, spaces, children } = this.props;

    const rawItems = spaces.data.filter(s => s.parentId === selectedSpace.parentId);
    const items = nameFilter(rawItems, filterText);

    return (
      <Fragment>
        <div
          className={styles.backdrop}
          style={{display: visible ? 'block' : 'none'}}
          onClick={() => this.onHide()}
        />
        <div className={styles.wrapper}>
          <span className={styles.target} onClick={() => this.onShow()}>{children}</span>
          <div className={styles.popup} style={{opacity: visible ? 1 : 0}}>
            <InputBox
              width="auto"
              type="text"
              placeholder="Search by space name"
              value={filterText}
              onChange={e => this.setState({
                filterText: e.target.value,
                activeItemIndex: null,
              })}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') {
                  if (activeItemIndex === null) {
                    this.setState({activeItemIndex: 0});
                  } else if (
                    typeof activeItemIndex === 'number' &&
                    (activeItemIndex as any) < items.length-1
                  ) {
                    this.setState({activeItemIndex: (activeItemIndex as any) + 1});
                  }

                } else if (e.key === 'ArrowUp') {
                  if (activeItemIndex === null) {
                    this.setState({activeItemIndex: 0});
                  } else if (
                    typeof activeItemIndex === 'number' &&
                    (activeItemIndex as any) > 0
                  ) {
                    this.setState({activeItemIndex: (activeItemIndex as any) - 1});
                  }

                } else if (e.key === 'Enter' && activeItemIndex !== null) {
                  this.onHide();
                  window.location.href = `#/admin/locations/${items[activeItemIndex as any].id}`;
                } else if (e.key === 'Escape') {
                  this.onHide();
                }
              }}
            />
            <nav onMouseLeave={() => this.setState({activeItemIndex: null})}>
              {items.map((space, index) => (
                <div
                  key={space.id}
                  className={classnames(
                    styles.popupItem,
                    {[styles.active]: activeItemIndex === index}
                  )}
                  onMouseEnter={() => this.setState({activeItemIndex: index})}
                >
                  <a
                    href={`#/admin/locations/${space.id}`}
                    onClick={this.onHide}
                  >{space.name}</a>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </Fragment>
    );
  }
}
