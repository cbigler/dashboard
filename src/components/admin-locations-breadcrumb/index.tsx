import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { DensitySpace } from '../../types';

import { InputBox, Icons } from '@density/ui/src';

import filterCollection from '../../helpers/filter-collection/index';

const INACTIVE_INDEX = -1;

export default function AdminLocationsBreadcrumb({ spaces, space }) {
  if (space) {
    return (
      <div className={styles.breadcrumb}>
        <a href={`#/admin/locations`} className={styles.item}>Locations</a>
        <Icons.ChevronRight />

        {space.ancestry.slice().reverse().map((s, index) => {
          return (
            <Fragment key={s.id}>
              <a
                href={`#/admin/locations/${s.id}`}
                key={s.id}
                className={styles.item}
              >{s.name}</a>
              <Icons.ChevronRight />
            </Fragment>
          );
        })}

        <span className={styles.item}>
          <BreadcrumbSiblingSelector selectedSpace={space} spaces={spaces} />
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
  spaces: {
    view: 'VISIBLE' | 'ERROR' | 'LOADING',
    data: Array<DensitySpace>,
    error: any,
  },
  selectedSpace: DensitySpace,
};

type BreadcrumbSiblingSelectorState = {
  visible: boolean,
  activeItemIndex: number,
  filterText: string,
};

const nameFilter = filterCollection({fields: ['name']});

export class BreadcrumbSiblingSelector extends Component<BreadcrumbSiblingSelectorProps, BreadcrumbSiblingSelectorState> {
  state = {
    visible: false,
    activeItemIndex: INACTIVE_INDEX,
    filterText: '',
  }

  filter = React.createRef()

  onShow = () => {
    this.setState({visible: true, activeItemIndex: INACTIVE_INDEX, filterText: ''}, () => {
      if (this.filter && this.filter.current) {
        (this.filter as any).current.focus();
      }
    });
  }
  onHide = () => {
    this.setState({visible: false});
  }

  render() {
    const { filterText, activeItemIndex, visible } = this.state;
    const { selectedSpace, spaces } = this.props;

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
          <span
            className={classnames(styles.target, {[styles.visible]: visible})}
            onClick={() => visible ? this.onHide() : this.onShow()}
          >
            <span className={styles.finalText}>{selectedSpace.name}</span>
            <div className={styles.finalChevron}><Icons.ChevronDown /></div>
          </span>
          <div className={styles.popup} style={{
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? 'auto' : 'none',
          }}>
            <div className={styles.popupSearchBar}>
              <InputBox
                width="100%"
                type="text"
                leftIcon={<Icons.Search />}
                placeholder="Search by space name"
                value={filterText}
                ref={this.filter}
                onChange={e => this.setState({
                  filterText: e.target.value,
                  activeItemIndex: INACTIVE_INDEX,
                })}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') {
                    if (activeItemIndex === INACTIVE_INDEX) {
                      this.setState({activeItemIndex: 0});
                    } else if (
                      typeof activeItemIndex === 'number' &&
                      (activeItemIndex as any) < items.length-1
                    ) {
                      this.setState({activeItemIndex: activeItemIndex + 1});
                    }

                  } else if (e.key === 'ArrowUp') {
                    if (activeItemIndex === null) {
                      this.setState({activeItemIndex: 0});
                    } else if (activeItemIndex > 0) {
                      this.setState({activeItemIndex: activeItemIndex - 1});
                    }

                  } else if (e.key === 'Enter' && activeItemIndex !== null) {
                    this.onHide();
                    window.location.href = `#/admin/locations/${items[activeItemIndex].id}`;
                  } else if (e.key === 'Escape') {
                    this.onHide();
                  }
                }}
              />
            </div>

            <nav onMouseLeave={() => this.setState({activeItemIndex: INACTIVE_INDEX})}>
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
                    onFocus={() => this.setState({activeItemIndex: index})}
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
