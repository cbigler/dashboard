import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import {
  DensityMark,
  Icons,
} from '@density/ui';

import stringToBoolean from '../../helpers/string-to-boolean';


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
    
    return (<AppNavbarMenuContext.Provider value={this}>
      <div className="app-navbar-menu">
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
          {children}
        </nav>
      </div>
    </AppNavbarMenuContext.Provider>);
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
function AppNavbarItem({selected, showOnMobile, icon, text, path = undefined as string | undefined}) {
  return (
    <li className={classnames('app-navbar-item', { selected, showOnMobile })}>
      <a href={path}>
        {icon ? <span className="app-navbar-icon">
          {selected ? React.cloneElement(icon, {color: colorVariables.brandPrimaryNew}) : icon}
        </span> : null}
        {text}
      </a>
    </li>
  );
}


// Define the real app navbar here
export default function AppNavbar({page, userRole, settings}) {
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
          {['owner', 'admin'].includes(userRole) ?
            <AppNavbarMenu
              header={<AppNavbarItem
                selected={['ADMIN_USER_MANAGEMENT', 'DEV_TOKEN_LIST', 'DEV_WEBHOOK_LIST', 'SENSORS_LIST'].includes(page)}
                showOnMobile={true}
                icon={<Icons.Team />}
                text="Admin"
              />}
            >
              <AppNavbarMenuItem
                path="#/admin/user-management"
                text="User Management"
                icon={<Icons.Team />}
                selected={['ADMIN_USER_MANAGEMENT'].includes(page)}
              />
              {['owner'].includes(userRole) ?
                <Fragment>
                  <AppNavbarMenuItem
                    path="#/dev/tokens"
                    text="Developer"
                    icon={<Icons.Lightning />}
                    selected={['DEV_TOKEN_LIST', 'DEV_WEBHOOK_LIST'].includes(page)}
                  />
                  <AppNavbarMenuItem
                    path="#/sensors"
                    text="DPU Status"
                    icon={<Icons.Error />}
                    selected={['SENSORS_LIST'].includes(page)}
                  />
                </Fragment> : null
              }
            </AppNavbarMenu> : null
          }
          <AppNavbarMenu
            header={<AppNavbarItem
              selected={['ACCOUNT'].includes(page)}
              showOnMobile={true}
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
