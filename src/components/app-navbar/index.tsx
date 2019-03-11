import React, { Component } from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import { Icons } from '@density/ui';

import can, { PERMISSION_CODES } from '../../helpers/permissions';
import stringToBoolean from '../../helpers/string-to-boolean';

function getUserLabel(user) {
  return `${user.organization.name}: ${user.fullName} (${user.role})`;
}


// Context and components for app navbar menu
export const AppNavbarMenuContext = React.createContext({} as any);

class AppNavbarMenu extends Component<any, any> {
  selectBoxValueRef: any;

  state = {opened: false}
  onMenuFocus = () => { this.setState({opened: true}); };
  onMenuBlur = () => { this.setState({opened: false}); };

  render() {
    const { opened } = this.state;
    const { header, children } = this.props;
    
    return <div className="app-navbar-menu">
      <div
        ref={r => { this.selectBoxValueRef = r; }}
        className={classnames('app-navbar-menu-target', {opened})}
        tabIndex={0}
        onFocus={this.onMenuFocus}
        onBlur={this.onMenuBlur}
        onMouseDown={e => {
          if (opened) {
            e.preventDefault();
            this.selectBoxValueRef.blur();
            this.onMenuBlur();
          }
        }}
      >
        {header}
      </div>
      <nav className={classnames('app-navbar-menu-items', {opened})}>
        <AppNavbarMenuContext.Provider value={{
          onMenuFocus: this.onMenuFocus,
          onMenuBlur: this.onMenuBlur
        }}>
          {children}
        </AppNavbarMenuContext.Provider>
      </nav>
    </div>;
  }
}

function AppNavbarMenuItem({path, text, icon, selected}) {
  return <AppNavbarMenuContext.Consumer>{context => <a
    className={classnames('app-navbar-menu-item', {selected})}
    style={{paddingLeft: 2}}
    href={path}
    tabIndex={0}
    onFocus={context.onMenuFocus}
    onBlur={context.onMenuBlur}
    onClick={context.onMenuBlur}
  >
    <span className="app-navbar-menu-item-icon">
      {selected ? React.cloneElement(icon, {color: colorVariables.brandPrimaryNew}) : icon}
    </span>
    {text}
  </a>}</AppNavbarMenuContext.Consumer>;
}

// Component for top-level app navbar item
function AppNavbarItem({
  selected,
  showOnMobile,
  icon,
  text,
  style = {},
  path = undefined as string | undefined,
  onClick = undefined as ((event: any) => void) | undefined,
  hideOnDesktop = false
}) {
  return (
    <li
      className={classnames('app-navbar-item', { selected, showOnMobile, hideOnDesktop })}
      style={style}
    >
      <a href={path} onClick={onClick}>
        {icon ? <span className="app-navbar-icon">
          {selected ? React.cloneElement(icon, {color: colorVariables.brandPrimaryNew}) : icon}
        </span> : null}
        {text}
      </a>
    </li>
  );
}


// Define the real app navbar here
export default function AppNavbar({page, user, settings, onClickImpersonate}) {

  const showAdminMenu = can(user, PERMISSION_CODES.developer_tools_manage) ||
    can(user, PERMISSION_CODES.owner_user_manage) ||
    can(user, PERMISSION_CODES.admin_user_manage) ||
    can(user, PERMISSION_CODES.readonly_user_manage);

  return (
    <div className="app-navbar-container">
      <div className="app-navbar">
        <ul className="app-navbar-left">
          <div style={{
            margin: '0 16px 0 8px',
            padding: '8px 7px',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colorVariables.grayCinder
          }}>
            <Icons.DensityMark color="white" />
          </div>
          {!stringToBoolean(settings.insightsPageLocked) ? <AppNavbarItem
            selected={['EXPLORE', 'EXPLORE_SPACE_DETAIL', 'EXPLORE_SPACE_TRENDS', 'EXPLORE_SPACE_DAILY', 'EXPLORE_SPACE_DATA_EXPORT'].includes(page)}
            showOnMobile={false}
            path="#/spaces/explore"
            icon={<Icons.Building />}
            text="Spaces"
          /> : null}
          {stringToBoolean(settings.dashboardEnabled) ? <AppNavbarItem
            selected={['DASHBOARD_LIST', 'DASHBOARD_DETAIL'].includes(page)}
            showOnMobile={false}
            path="#/dashboards"
            icon={<Icons.Dashboards />}
            text="Dashboards"
          /> : null}
          <AppNavbarItem
            selected={['LIVE_SPACE_LIST', 'LIVE_SPACE_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/spaces/live"
            icon={<Icons.StopWatch />}
            text="Live"
          />
          {stringToBoolean(settings.insightsPageLocked) ? <AppNavbarItem
            selected={['ACCOUNT_SETUP_OVERVIEW', 'ACCOUNT_SETUP_DOORWAY_LIST', 'ACCOUNT_SETUP_DOORWAY_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/onboarding"
            icon={<Icons.Copy />}
            text="Onboarding"
          /> : null}
        </ul>
        {can(user, PERMISSION_CODES.impersonate) ? <ul className="app-navbar-center">
          <li
            className={classnames('app-navbar-item', { selected: user.impersonating})}
            onClick={onClickImpersonate}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingRight: '8px',
              cursor: 'pointer'
            }}
          >
            <Icons.Security />
          </li>
          <li style={{listStyle: 'none'}}>{user.impersonating ? 
            getUserLabel(user.impersonating) :
            <span style={{color: colorVariables.gray}}>Impersonation off</span>
          }</li>
        </ul> : null}
        <ul className="app-navbar-right">

          {/* Mobile logout button */}
          <AppNavbarItem
            selected={false}
            showOnMobile={true}
            hideOnDesktop={true}
            path="#/logout"
            style={{ marginRight: -32, marginTop: 4 }}
            icon={<Icons.Logout />}
            text=""
          />

          {/* Desktop menus */}
          {showAdminMenu ?
            <AppNavbarMenu
              header={<AppNavbarItem
                selected={['ADMIN_USER_MANAGEMENT', 'ADMIN_DEVELOPER', 'ADMIN_DEVICE_STATUS'].includes(page)}
                showOnMobile={false}
                icon={<Icons.Cog />}
                text="Admin"
              />}
            >
              <AppNavbarMenuItem
                path="#/admin/user-management"
                text="User Management"
                icon={<Icons.Team />}
                selected={['ADMIN_USER_MANAGEMENT'].includes(page)}
              />
              {can(user, PERMISSION_CODES.developer_tools_manage) ?
                <AppNavbarMenuItem
                  path="#/admin/developer"
                  text="Developer"
                  icon={<Icons.Code />}
                  selected={['ADMIN_DEVELOPER'].includes(page)}
                /> : null}
              {can(user, PERMISSION_CODES.sensors_list) ?
                <AppNavbarMenuItem
                  path="#/admin/device-status"
                  text="DPU Status"
                  icon={<Icons.Heartbeat />}
                  selected={['ADMIN_DEVICE_STATUS'].includes(page)}
                /> : null}
            </AppNavbarMenu> : null
          }
          <AppNavbarMenu
            header={<AppNavbarItem
              selected={['ACCOUNT'].includes(page)}
              showOnMobile={false}
              icon={<Icons.Person />}
              text="Account"
            />}
          >
            <AppNavbarMenuItem
              path="#/account"
              text="Your Account"
              icon={<Icons.Person />}
              selected={['ACCOUNT'].includes(page)}
            />
            <AppNavbarMenuItem
              path="#/logout"
              text="Logout"
              icon={<Icons.Logout />}
              selected={false}
            />
          </AppNavbarMenu>
        </ul>
      </div>
    </div>
  );
}
