import styles from './styles.module.scss';

import React, { Component } from 'react';
import classnames from 'classnames';
import colorVariables from '@density/ui/variables/colors.json';

import { Icons } from '@density/ui/src';

import can, { PERMISSION_CODES } from '../../helpers/permissions';
import stringToBoolean from '../../helpers/string-to-boolean';

import { ROLE_INFO } from '../../helpers/permissions/index';

import { ON_PREM } from '../../fields';

function getUserLabel(user, hidden) {
  if (hidden) {
    return ""
  } else {
    return <span style={{fontWeight: 'normal'}}>
      <span style={{fontWeight: 'bold'}}>{user.organization.name}:</span>{' '}
      <span>{user.full_name || user.email}</span>{' '}
      <span style={{color: colorVariables.midnight}}>({ROLE_INFO[user.role].label})</span>
    </span>;
  }
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

    return <div className={styles.appNavbarMenu}>
      <div
        ref={r => { this.selectBoxValueRef = r; }}
        className={classnames(styles.appNavbarMenuTarget, {[styles.opened]: opened})}
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
      <nav className={classnames(styles.appNavbarMenuItems, {[styles.opened]: opened})}>
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
    className={classnames(styles.appNavbarMenuItem, {[styles.selected]: selected})}
    style={{paddingLeft: 2}}
    href={path}
    tabIndex={0}
    onFocus={context.onMenuFocus}
    onBlur={context.onMenuBlur}
    onClick={context.onMenuBlur}
  >
    <span className={styles.appNavbarMenuItemIcon}>
      {selected ? React.cloneElement(icon, {color: colorVariables.midnight}) : icon}
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
  targetBlank = false,
  hideOnDesktop = false
}) {
  return (
    <li
      className={classnames(styles.appNavbarItem, {
        [styles.selected]: selected,
        [styles.showOnMobile]: showOnMobile,
        [styles.hideOnDesktop]: hideOnDesktop
      })}
      style={style}
    >
      <a href={path} onClick={onClick} target={targetBlank ? "_blank" : ""}>
        {icon ? <span className={styles.appNavbarIcon}>
          {selected ? React.cloneElement(icon, {color: colorVariables.midnight}) : icon}
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
  const showAdminMenu = (
    can(user, PERMISSION_CODES.developerToolsManage) ||
    can(user, PERMISSION_CODES.ownerUserManage) ||
    can(user, PERMISSION_CODES.adminUserManage) ||
    can(user, PERMISSION_CODES.readonlyUserManage)
  );

  return (
    <div className={styles.appNavbarContainer}>
      <div className={styles.appNavbar}>
        <ul className={styles.appNavbarLeft}>
          <div className={styles.appNavbarLogo}>
            <Icons.DensityMark color={colorVariables.white} height={14} width={14} />
          </div>
          {!stringToBoolean(settings.insights_page_locked) ? <AppNavbarItem
            selected={['SPACES', 'SPACES_SPACE', 'SPACES_DOORWAY'].includes(page)}
            showOnMobile={true}
            path="#/spaces"
            icon={<Icons.Space />}
            text="Spaces"
          /> : null}
          {stringToBoolean(settings.analytics_enabled) ? <AppNavbarItem
            selected={['ANALYTICS'].includes(page)}
            showOnMobile={true}
            path="#/analytics"
            icon={<Icons.Report />}
            text="Analytics"
          /> : null}
          {stringToBoolean(settings.dashboard_enabled) ? <AppNavbarItem
            selected={['DASHBOARD_LIST', 'DASHBOARD_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/dashboards"
            icon={<Icons.Dashboard />}
            text="Dashboards"
          /> : null}
          <AppNavbarItem
            selected={['LIVE_SPACE_LIST', 'LIVE_SPACE_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/spaces/live"
            icon={<Icons.StopWatch />}
            text="Live"
          />
          {stringToBoolean(settings.queue_enabled) ? <AppNavbarItem
            selected={['QUEUE_SPACE_LIST', 'QUEUE_SPACE_DETAIL'].includes(page)}
            showOnMobile={true}
            path="#/display/spaces"
            icon={<Icons.PersonHuddle />}
            text="Safe Display"
          /> : null}
        </ul>

        <ul className={styles.appNavbarRight}>
          {/* Impersonation interface */}
          {!ON_PREM && (impersonate || can(user, PERMISSION_CODES.impersonate)) ? (
            impersonate && impersonate.enabled && impersonate.selectedUser ?
              <li
                className={classnames(styles.appNavbarItem, { [styles.showOnMobile]: true })}
                style={{cursor: 'pointer', opacity: 1}}
              >
                <span onClick={onClickImpersonate}>
                  <span className={styles.appNavbarIcon}>
                    <Icons.ImpersonateOn color={colorVariables.midnight} />
                  </span>
                  {getUserLabel(impersonate.selectedUser, impersonate.hidden)}
                </span>
              </li>
              : <AppNavbarItem
                selected={false}
                showOnMobile={true}
                onClick={onClickImpersonate}
                icon={<Icons.ImpersonateOff />}
                text="Impersonate"
                style={{cursor: 'pointer'}}
              />
          ) : null}

          {/* Support link (opens in new tab) */}
          {!ON_PREM ? (
            <AppNavbarItem
              selected={false}
              showOnMobile={true}
              path="https://help.density.io/"
              targetBlank={true}
              icon={<Icons.Chat />}
              text="Support"
            />
          ) : null}

          {/* Mobile logout button */}
          <AppNavbarItem
            selected={false}
            showOnMobile={false}
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
                selected={[
                  'ADMIN_USER_MANAGEMENT',
                  'ADMIN_DEVELOPER',
                  'ADMIN_LOCATIONS',
                  'ADMIN_SPACE_MAPPINGS',
                  'ADMIN_DEVICE_STATUS',
                ].includes(page)}
                showOnMobile={true}
                icon={<Icons.Cog />}
                text="Admin"
              />}
            >
              <AppNavbarMenuItem
                path="#/admin/locations"
                text="Locations"
                icon={<Icons.Globe />}
                selected={['ADMIN_LOCATIONS'].includes(page)}
              />
              <AppNavbarMenuItem
                path="#/admin/user-management"
                text="User Management"
                icon={<Icons.Team />}
                selected={['ADMIN_USER_MANAGEMENT'].includes(page)}
              />
              {can(user, PERMISSION_CODES.developerToolsManage) && !ON_PREM ? <AppNavbarMenuItem
                path="#/admin/integrations"
                text="Integrations"
                icon={<Icons.Integrations2 />}
                selected={['ADMIN_INTEGRATIONS', 'ADMIN_SPACE_MAPPINGS'].includes(page)}
              /> : null}
              {can(user, PERMISSION_CODES.developerToolsManage) ?
                <AppNavbarMenuItem
                  path="#/admin/developer"
                  text="Developer"
                  icon={<Icons.Code />}
                  selected={['ADMIN_DEVELOPER'].includes(page)}
                /> : null}
              {can(user, PERMISSION_CODES.sensorsList) ?
                <AppNavbarMenuItem
                  path="#/admin/device-status"
                  text="Sensor Status"
                  icon={<Icons.Heartbeat />}
                  selected={['ADMIN_DEVICE_STATUS'].includes(page)}
                /> : null}
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
              icon={<Icons.Power />}
              selected={false}
            />
          </AppNavbarMenu>
        </ul>
      </div>
    </div>
  );
}
