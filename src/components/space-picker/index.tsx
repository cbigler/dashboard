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
  value: Array<SpaceHierarchyDisplayItem> | Array<string> | SpaceHierarchyDisplayItem | string | null,
  onChange: (SpaceHierarchyDisplayItem) => any,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,

  searchBoxPlaceholder?: string,
  placeholder?: string,
  width?: number | string,
  height?: number | string,
  canSelectMultiple?: boolean,
  isItemDisabled?: (SpaceHierarchyDisplayItem) => boolean,
};

function convertValueToSpaceIds(
  value: Array<SpaceHierarchyDisplayItem> | Array<string> | SpaceHierarchyDisplayItem | string | null,
  canSelectMultiple: boolean,
): Array<string> {
  // Extract the id out of value
  if (canSelectMultiple) {
    if (!Array.isArray(value)) {
      throw new Error('Space Picker value prop is not an array, but `canSelectMultiple` is true! This is not a valid state.');
    }
    if (value.length === 0) {
      return [];
    } else if (typeof value[0] === 'string') {
      // An array of ids: ['spc_xxx', 'spx_abc']
      return value as Array<string>;
    } else {
      // An array of formatted hierarchy items:
      // - [{space: {id: 'spc_xxx', ...}, ...}]
      return (value as Array<SpaceHierarchyDisplayItem>).map(v => v.space.id);
    }
  } else {
    if (Array.isArray(value)) {
      throw new Error('Space Picker value prop is an array, but `canSelectMultiple` is false! This is not a valid state.');
    }
    if (!value) {
      // No value is selected
      return [];
    } else if (typeof value === 'string') {
      // A single id: 
      return [value];
    } else {
      // An single formatted hierarchy item:
      // - {space: {id: 'spc_xxx', ...}, ...}
      return [value.space.id];
    }
  }
}

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

  const selectedSpaceIds = convertValueToSpaceIds(value, canSelectMultiple);

  if (searchText.length > 0) {
    formattedHierarchy = spaceHierarchySearcher(formattedHierarchy, searchText);
  }

  // This function normalizes the difference between when `canSelectMultiple` is set or unset.
  function callOnChange(item, isChecked) {
    console.log('CALLONCHANGE', item, isChecked);
    if (canSelectMultiple) {
      if (isChecked) {
        onChange(
          [...selectedSpaceIds, item.space.id]
          .map(id => formattedHierarchy.find(h => h.space.id === id))
        );
      } else {
        onChange(
          selectedSpaceIds
          .filter(id => id !== item.space.id)
          .map(id => formattedHierarchy.find(h => h.space.id === id))
        );
      }
    } else {
      onChange(item);
    }
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
          const isChecked = Boolean(selectedSpaceIds.find(id => id === item.space.id));

          return (
            <div
              key={item.space.id}
              className={classnames(styles.item, {
                [styles.depth0]: item.depth === 0,
                [styles.disabled]: spaceDisabled,
              })}
              style={{marginLeft: item.depth * 24}}
              onMouseUp={e => {
                if (!spaceDisabled) {
                  callOnChange(item, !isChecked);
                }
              }}
            >
              {canSelectMultiple ? (
                <Checkbox
                  disabled={spaceDisabled}
                  checked={isChecked}
                  onChange={e => {}}
                />
              ) : (
                <RadioButton
                  disabled={spaceDisabled}
                  checked={isChecked}
                  onChange={e => {}}
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

type SpacePickerDropdownProps = SpacePickerProps & {
  dropdownWidth?: number | string,
};

export class SpacePickerDropdown extends Component<SpacePickerDropdownProps, {opened: boolean}> {
  state = {
    opened: false,
  };

  render() {
    let {
      value,
      placeholder,
      width,
      height,
      dropdownWidth,
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

    // Calculate a list of space names for all spaces that this space picker has selected
    const selectedSpaceNames = convertValueToSpaceIds(value, canSelectMultiple)
      .map(id => formattedHierarchy.find(h => h.space.id === id))
      .filter(hierarchyItem => typeof hierarchyItem !== 'undefined')
      .map((hierarchyItem: any) => hierarchyItem.space.name);

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
            {selectedSpaceNames.length > 0 ? (
              <span>{selectedSpaceNames.length > 1 ? `${selectedSpaceNames.length} spaces selected` : selectedSpaceNames[0]}</span>
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

            <div className={classnames(styles.popup, {[styles.visible]: opened})} style={{width: dropdownWidth}}>
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