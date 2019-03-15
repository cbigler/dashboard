import React from 'react';
import classnames from 'classnames';

import { Icons } from '@density/ui';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';

export default class SpaceHierarchySelectBox extends React.Component<any, any> {
  onMenuFocus: any;
  onMenuBlur: any;
  onMenuItemSelected: any;
  selectBoxValueRef: any;

  constructor(props) {
    super(props);

    this.state = {
      opened: false,
    };

    // Called when the user focuses either the value or an item in the menu part of the box.
    this.onMenuFocus = () => {
      this.setState({opened: true});
    };

    // Called when the user blurs either the value or an item in the menu part of the box.
    this.onMenuBlur = () => {
      this.setState({opened: false});
    };

    // Called when the user selects an item within the menu of the select box.
    this.onMenuItemSelected = choice => {
      this.setState({opened: false}, () => {
        if (this.props.onChange) {
          const isDefault = String(choice.id).toLowerCase() === 'default';
          this.props.onChange(isDefault ? null : choice);
        }
      });
    }
  }

  render() {
    const { choices, value, disabled, id } = this.props;
    const { opened } = this.state;

    const spaceHierarchy = spaceHierarchyFormatter(choices).map(n => ({
      depth: n.depth,
      choice: n.space,
    }));

    return <div className="space-hierarchy-select-box">
      <div
        id={id}
        ref={r => { this.selectBoxValueRef = r; }}
        className={classnames(`space-hierarchy-select-box-value`, {disabled, opened})}
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
          <span className="space-hierarchy-select-box-item-highlight">
            {value.spaceType ? `${value.spaceType[0].toUpperCase()}${value.spaceType.slice(1)}` : ''}
          </span>
        </span> : <span>
          All spaces
          <span className="space-hierarchy-select-box-item-highlight">Default</span>
        </span>}
        <div className="input-box-caret">
          <Icons.ChevronDown color="primary" width={12} height={12} />
        </div>
      </div>

      <div
        role="listbox"
        className={classnames('space-hierarchy-select-box-menu', {opened})}
      >
        <ul>
          {[
            {
              depth: 0,
              choice: {
                id: 'default',
                name: 'All spaces',
                spaceType: 'default',
              },
            },
            ...spaceHierarchy,
          ].map(({depth, choice}) => {
            return <li
              key={choice.id}
              id={`input-box-select-${String(choice.id).replace(' ', '-')}`}
              role="option"
              style={{paddingLeft: 15 + depth * 10}}
              className={classnames('space-hierarchy-select-box-menu-item', {
                disabled: choice.disabled,
                enabled: !choice.disabled
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
              <span className="space-hierarchy-select-box-item-name">{choice.name}</span>
              <span className="space-hierarchy-select-box-item-highlight">
                {(() => {
                  if (choice.disabled) {
                    return '(0)';
                  } else {
                    return choice.spaceType ? `${choice.spaceType[0].toUpperCase()}${choice.spaceType.slice(1)}` : '';
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
