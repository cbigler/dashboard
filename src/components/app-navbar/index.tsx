import React, { Component } from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import { Icons } from '@density/ui';

import can, { PERMISSION_CODES } from '../../helpers/permissions';
import stringToBoolean from '../../helpers/string-to-boolean';

import { ROLE_INFO } from '../../helpers/permissions/index';

function getUserLabel(user) {
  return <span style={{fontWeight: 'normal'}}>
    <span style={{fontWeight: 'bold'}}>{user.organization.name}:</span>{' '}
    <span>{user.fullName || user.email}</span>{' '}
    <span style={{color: colorVariables.brandPrimary}}>({ROLE_INFO[user.role].label})</span>
  </span>;
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
export default function AppNavbar({
  page,
  user,
  settings,
  impersonate,
  onClickImpersonate
}) {

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
        <ul className="app-navbar-right">

          {/* Impersonation interface */}
          {(impersonate || can(user, PERMISSION_CODES.impersonate)) ? (
            impersonate && impersonate.enabled && impersonate.selectedUser ?
              <li
                className={classnames('app-navbar-item', { showOnMobile: true })}
                style={{cursor: 'pointer', opacity: 1}}
              >
                <a onClick={onClickImpersonate}>
                  <span className="app-navbar-icon">{
                    <svg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                      <g id='Symbols' fill='none' fillRule='evenodd'>
                        <g id='navbar-/-icon-/-impersonation-(fill)'>
                          <g id='IconSecurityFill'>
                            <rect id='bounds' fillOpacity='0' fill='#E3E3E6' width='20' height='20'
                            />
                            <polygon id='Path' fill={colorVariables.brandPrimary} fillRule='nonzero' points='10 0.209430585 19.910252 3.51284792 16.6496836 15.4682654 10 19.9013878 3.35031642 15.4682654 0.0897480056 3.51284792'
                            />
                            <circle id='Oval' fill='#FFF' cx='10' cy='7' r='3' />
                            <path d='M5,14.5 C5,14.3338815 5.01620211,13.1715473 5.04711229,13.0144913 C5.27311546,11.866159 6.28540659,11 7.5,11 L12.5,11 C13.7163773,11 14.7298576,11.8687051 14.9538784,13.0195528 C14.984144,13.1750342 15,14.3356654 15,14.5 L10,18 L5,14.5 Z'
                            id='Path' fill='#FFF' />
                          </g>
                        </g>
                      </g>
                    </svg>
                  }</span>
                  {getUserLabel(impersonate.selectedUser)}
                </a>
              </li>
              : <AppNavbarItem
                selected={false}
                showOnMobile={true}
                onClick={onClickImpersonate}
                icon={<Icons.Security />}
                text="Impersonate"
                style={{cursor: 'pointer'}}
              />
          ) : null}

          {/* Mobile logout button */}
          <AppNavbarItem
            selected={false}
            showOnMobile={true}
            hideOnDesktop={true}
            path="#/logout"
            style={{ marginRight: -8, marginTop: 2 }}
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
                  path="#/admin/integrations"
                  text="Integrations"
                  icon={<Icons.Code />}
                  selected={['ADMIN_INTEGRATIONS'].includes(page)}
                /> : null}
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
