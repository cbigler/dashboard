import React, { useState, Component, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

import {
  Icons,
  InputBox,
  AppBar,
  RadioButton,
} from '@density/ui';
import Checkbox from '../checkbox';

import colorVariables from '@density/ui/variables/colors.json';

import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import spaceHierarchySearcher from '../../helpers/space-hierarchy-searcher/index';

type SpacePickerProps = {
  value: Array<SpaceHierarchyDisplayItem> | SpaceHierarchyDisplayItem | null,
  onChange: (SpaceHierarchyDisplayItem) => any,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,

  searchBoxPlaceholder?: string,
  placeholder?: string,
  width?: number,
  height?: number | string,
  canSelectMultiple?: boolean,
  isItemDisabled?: (SpaceHierarchyDisplayItem) => boolean,
};

export default function SpacePicker({
  value,
  onChange,
  formattedHierarchy,

  canSelectMultiple=false,
  isItemDisabled=(s) => false,
  height,
  searchBoxPlaceholder=`ex: "New York"`,
}: SpacePickerProps) {
  const [searchText, setSearchText] = useState('');

  if (searchText.length > 0) {
    formattedHierarchy = spaceHierarchySearcher(formattedHierarchy, searchText);
  }

  return (
    <div>
      <div className={styles.searchBar}>
        <AppBar>
          <InputBox
            type="text"
            leftIcon={<Icons.Search />}
            placeholder={searchBoxPlaceholder}
            width="100%"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </AppBar>
      </div>

      <div className={styles.scrollContainer} style={{height}}>
        {formattedHierarchy.map(item => {
          const spaceDisabled = !item.space.hasPurview || isItemDisabled(item);

          let isChecked: boolean = false;
          if (value && canSelectMultiple) {
            // Multi select mode, `value` is an array of space hiearchy items
            isChecked = Boolean((value as Array<SpaceHierarchyDisplayItem>).find(v => v.space.id === item.space.id));
          } else if (value && !canSelectMultiple) {
            // Single select mode, `value` is a single space hiearchy item
            isChecked = (value as SpaceHierarchyDisplayItem).space.id === item.space.id;
          }
          return (
            <div
              key={item.space.id}
              className={classnames(styles.item, {
                [styles.depth0]: item.depth === 0,
                [styles.disabled]: spaceDisabled,
              })}
              style={{marginLeft: item.depth * 24}}
              onClick={() => {
                if (!spaceDisabled) {
                  onChange(item);
                }
              }}
            >
              {canSelectMultiple ? (
                <Checkbox
                  disabled={spaceDisabled}
                  checked={isChecked}
                  onChange={() => onChange(item)}
                />
              ) : (
                <RadioButton
                  disabled={spaceDisabled}
                  checked={isChecked}
                  onChange={() => onChange(item)}
                />
              )}

              {item.space.spaceType === 'building' ? (
                <span className={styles.itemIcon}>
                  <Icons.Building
                    color={isChecked ? colorVariables.grayCinder : colorVariables.grayDarker}
                  />
                </span>
              ) : null}
              {item.space.spaceType === 'floor' ? (
                <span className={styles.itemIcon}>
                  <Icons.Folder
                    color={isChecked ? colorVariables.grayCinder : colorVariables.grayDarker}
                  />
                </span>
              ) : null}

              <span
                className={classnames(styles.itemName, {
                  [styles.bold]: ['campus', 'building', 'floor'].includes(item.space.spaceType),
                  [styles.disabled]: spaceDisabled,
                })}
              >
                {item.space.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export class SpacePickerDropdown extends Component<SpacePickerProps, {opened: boolean}> {
  state = {
    opened: false,
  };

  render() {
    let {
      value,
      placeholder,
      width,
      height,
      searchBoxPlaceholder,
      formattedHierarchy,
      canSelectMultiple,
      isItemDisabled,
      onChange,
    } = this.props;

    isItemDisabled = typeof isItemDisabled === 'undefined' ? s => false : isItemDisabled;
    canSelectMultiple = typeof canSelectMultiple === 'undefined' ? false : canSelectMultiple;
    height = typeof height === 'undefined' ? 256 : height;

    const { opened } = this.state;

    return (
      <Fragment>
        <div
          className={classnames(styles.backdrop, {[styles.visible]: opened})}
          onClick={() => this.setState({opened: false})}
        />

        <div className={styles.spacePicker} style={{width}}>
          <div
            className={classnames(styles.box, {[styles.focus]: opened})}
            // When focused, open the select box
            tabIndex={0}
            onFocus={e => {
              e.preventDefault();
              this.setState({opened: true});
            }}
            onMouseDown={() => {
              this.setState({opened: !opened});
            }}
          >
            {value ? (
              <span>{Array.isArray(value) ? `${value.length} spaces selected` : value.space.name}</span>
            ) : (
              <span className={styles.placeholder}>
                {placeholder || `No ${canSelectMultiple ? 'spaces' : 'space'} selected`}
              </span>
            )}
            <span className={classnames(styles.chevron, {[styles.flip]: opened})}>
              <Icons.ChevronDown
                width={12}
                height={12}
                color={colorVariables.brandPrimary}
              />
            </span>
          </div>

          <div className={classnames(styles.popup, {[styles.visible]: opened})}>
            <SpacePicker
              value={value}
              onChange={onChange}

              searchBoxPlaceholder={searchBoxPlaceholder}
              formattedHierarchy={formattedHierarchy}
              canSelectMultiple={canSelectMultiple}
              isItemDisabled={isItemDisabled}
              height={height}
            />
          </div>
        </div>
      </Fragment>
    );
  }
}
