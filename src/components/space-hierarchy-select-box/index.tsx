import React from 'react';
import classnames from 'classnames';

import { Icons } from '@density/ui/src';
import styles from './styles.module.scss';

import spaceHierarchyFormatterDeprecated from '../../helpers/space-hierarchy-formatter-deprecated/index';

export default class SpaceHierarchySelectBox extends React.Component<any, any> {
  selectBoxValueRef: any;

  state = {
    opened: false,
  };

  // Called when the user focuses either the value or an item in the menu part of the box.
  onMenuFocus = () => {
    this.setState({opened: true});
  };

  // Called when the user blurs either the value or an item in the menu part of the box.
  onMenuBlur = () => {
    this.setState({opened: false});
  };

  // Called when the user selects an item within the menu of the select box.
  onMenuItemSelected = choice => {
    this.setState({opened: false}, () => {
      if (this.props.onChange) {
        const isDefault = String(choice.id).toLowerCase() === 'default';
        this.props.onChange(isDefault ? null : choice);
      }
    });
  }

  render() {
    const { choices, value, disabled, id } = this.props;
    const { opened } = this.state;

    const spaceHierarchy = spaceHierarchyFormatterDeprecated(choices).map(n => ({
      depth: n.depth,
      choice: n.space,
    }));

    return <div className={styles.spaceHierarchySelectBox}>
      <div
        id={id}
        ref={r => { this.selectBoxValueRef = r; }}
        className={classnames(styles.spaceHierarchySelectBoxValue, {[styles.disabled]: disabled, [styles.opened]: opened})}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={opened}
        aria-autocomplete="list"

        onFocus={this.onMenuFocus}
        onBlur={this.onMenuBlur}
        onKeyDown={e => {
          if (e.keyCode === 27 /* escape */) {
            /* Blur the select value box, which closes the dropdown */
            this.selectBoxValueRef.blur();
            this.onMenuBlur();
          }
        }}
        onMouseDown={e => {
          if (this.state.opened) {
            /* Prevent the default "focus" handler from re-opening the dropdown */
            e.preventDefault();
            /* Blur the select value box, which closes the dropdown */
            this.selectBoxValueRef.blur();
            this.onMenuBlur();
          }
        }}
      >
        {value ? <span>
          {value.name}
          <span className={styles.spaceHierarchySelectBoxItemHighlight}>
            {value.space_type ? `${value.space_type[0].toUpperCase()}${value.space_type.slice(1)}` : ''}
          </span>
        </span> : <span>
          All spaces
          <span className={styles.spaceHierarchySelectBoxItemHighlight}>Default</span>
        </span>}
        <div className={styles.inputBoxCaret}>
          <Icons.ChevronDown />
        </div>
      </div>

      <div
        role="listbox"
        className={classnames(styles.spaceHierarchySelectBoxMenu, {[styles.opened]: opened})}
      >
        <ul>
          {[
            {
              depth: 0,
              choice: {
                id: 'default',
                name: 'All spaces',
                space_type: 'default',
              },
            },
            ...spaceHierarchy,
          ].map(({depth, choice}) => {
            return <li
              key={choice.id}
              id={`input-box-select-${String(choice.id).replace(' ', '-')}`}
              role="option"
              style={{paddingLeft: 15 + depth * 10}}
              className={classnames(styles.spaceHierarchySelectBoxMenuItem, {
                [styles.disabled]: choice.disabled,
                [styles.enabled]: !choice.disabled
              })}
              tabIndex={!choice.disabled && opened ? 0 : -1}
              aria-selected={value && value.id === choice.id}

              onFocus={this.onMenuFocus}
              onBlur={this.onMenuBlur}
              onKeyDown={e => {
                if (e.keyCode === 13 /* enter */) {
                  /* Select this item in the menu */
                  this.onMenuItemSelected(choice);
                } else if (e.keyCode === 27 /* escape */) {
                  /* Blur this item, which closes the dropdown */
                  (e.target as any).blur();
                }
              }}
              onMouseDown={e => {
                /* Prevent click from focusing disabled elements */
                if (choice.disabled) { e.preventDefault(); }
              }}
              onClick={() => {
                /* Allow click to select elements that aren't disabled */
                if (!choice.disabled) { this.onMenuItemSelected(choice); }
              }}
            >
              <span className={styles.spaceHierarchySelectBoxItemName}>{choice.name}</span>
              <span className={styles.spaceHierarchySelectBoxItemHighlight}>
                {(() => {
                  if (choice.disabled) {
                    return '(0)';
                  } else {
                    return choice.space_type ? `${choice.space_type[0].toUpperCase()}${choice.space_type.slice(1)}` : '';
                  }
                })()}
              </span>
            </li>;
          })}
        </ul>
      </div>
    </div>;
  }
}
