import React, { Component } from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';
import DensityMark from '@density/ui-density-mark';

import {
  IconDashboards,
  IconGlobe,
  IconStopWatch,
  IconCopy,
  IconLightning,
  IconPerson,
  IconLogout,
  IconError
} from '@density/ui-icons';

import stringToBoolean from '../../helpers/string-to-boolean';

function AppNavbarItem({isSelected, showOnMobile, path, icon, name}) {
  const selected = isSelected();
  const Icon = icon;
  return (
    <li className={classnames('app-navbar-item', { selected, showOnMobile })}>
      <a href={path}>
        {icon ? <span className="app-navbar-icon">
          {selected ? <Icon color={colorVariables.brandPrimaryNew} /> : <Icon />}
        </span> : null}
        {name}
      </a>
    </li>
  );
}

class AppNavbarMenu extends Component<any, any> {
  selectBoxValueRef: any;

  state = {opened: false}

  // Called when the user focuses either the value or an item in the menu part of the box.
  onMenuFocus = () => {
    this.setState({opened: true});
  };

  // Called when the user blurs either the value or an item in the menu part of the box.
  onMenuBlur = () => {
    this.setState({opened: false});
  };

  render() {
    const { opened } = this.state;
    const { selectedPage } = this.props;

    const accountSelected = ['ACCOUNT'].includes(selectedPage)
    const sensorsSelected = ['SENSORS_LIST'].includes(selectedPage)
    const navBarMenuDropdownSelected = accountSelected || sensorsSelected;
    
    return (
      <div className="app-navbar-menu">
        <div
          ref={r => { this.selectBoxValueRef = r; }}
          className={classnames('app-navbar-menu-value', {selected: navBarMenuDropdownSelected})}
          tabIndex={0}
          onFocus={this.onMenuFocus}
          onBlur={this.onMenuBlur}
          onMouseDown={e => {
            if (opened) {
              /* Prevent the default "focus" handler from re-opening the dropdown */
              e.preventDefault();
              /* Blur the select value box, which closes the dropdown */
              this.selectBoxValueRef.blur();
              this.onMenuBlur();
            }
          }}
        >
          <DensityMark size={32} color="white" />
        </div>
        <nav className={classnames('app-navbar-menu-items', {opened})}>
          <a
            className={classnames('app-navbar-menu-item', {selected: accountSelected})}
            style={{paddingLeft: 2}}
            href="#/account"
            tabIndex={0}
            onFocus={this.onMenuFocus}
            onBlur={this.onMenuBlur}
            onClick={this.onMenuBlur}
          >
            <span className="app-navbar-menu-item-icon">
              {accountSelected ? <IconPerson color={colorVariables.brandPrimaryNew} /> : <IconPerson />}
            </span>
            Your Account
          </a>
          <a
            className={classnames('app-navbar-menu-item', {selected: sensorsSelected})}
            href="#/sensors"
            tabIndex={0}
            onFocus={this.onMenuFocus}
            onBlur={this.onMenuBlur}
            onClick={this.onMenuBlur}
          >
            <span className="app-navbar-menu-item-icon">
              {sensorsSelected ? <IconError color={colorVariables.brandPrimaryNew} /> : <IconError />}
            </span>
            DPU Status
          </a>
          <a
            className="app-navbar-menu-item"
            href="#/logout"
            tabIndex={0}
            onFocus={this.onMenuFocus}
            onBlur={this.onMenuBlur}
            onClick={this.onMenuBlur}
          >
            <span className="app-navbar-menu-item-icon">
              <IconLogout />
            </span>
            Logout
          </a>
        </nav>
      </div>
    );
  }
}

export default function AppNavbar({page, settings}) {
  return (
    <div className="app-navbar-container">
      <div className="app-navbar">
        <ul className="app-navbar-left">
          {stringToBoolean(settings.dashboardEnabled) ? <AppNavbarItem
            isSelected={() => ['DASHBOARD_LIST', 'DASHBOARD_DETAIL'].includes(page)}
            showOnMobile={false}
            path="#/dashboards"
            icon={IconDashboards}
            name="Dashboards"
          /> : null}
          {!stringToBoolean(settings.insightsPageLocked) ? <AppNavbarItem
            isSelected={() => ['EXPLORE', 'EXPLORE_SPACE_DETAIL', 'EXPLORE_SPACE_TRENDS', 'EXPLORE_SPACE_DAILY', 'EXPLORE_SPACE_DATA_EXPORT'].includes(page)}
            showOnMobile={false}
            path="#/spaces/explore"
            icon={IconGlobe}
            name="Explore"
          /> : null}
          <AppNavbarItem
            isSelected={() => ['LIVE_SPACE_LIST', 'LIVE_SPACE_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/spaces/live"
            icon={IconStopWatch}
            name="Live"
          />
          <AppNavbarItem
            isSelected={() => ['DEV_TOKEN_LIST', 'DEV_WEBHOOK_LIST'].includes(page)}
            showOnMobile={false}
            path="#/dev/tokens"
            icon={IconLightning}
            name="Developer"
          />
          {stringToBoolean(settings.insightsPageLocked) ? <AppNavbarItem
            isSelected={() => ['ACCOUNT_SETUP_OVERVIEW', 'ACCOUNT_SETUP_DOORWAY_LIST', 'ACCOUNT_SETUP_DOORWAY_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/onboarding"
            icon={IconCopy}
            name="Onboarding"
          /> : null}
        </ul>
        <ul className="app-navbar-right">
          <AppNavbarMenu selectedPage={page}/>
        </ul>
      </div>
    </div>
  );
}
