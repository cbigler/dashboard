import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';

import SidebarMenu from 'dashboard/components/SidebarMenu';
import {logoutUser} from 'dashboard/actions/logout';
import {sideNavToggle} from 'dashboard/actions/appbar';

function Appbar(props) {
  const {
    sideNavOpen,
    onAppBarSideNavClicked,
    onLogOutClicked
  } = props;
  
  return (
    <div>
      <div className={sideNavOpen ? "side-nav open" : "side-nav"}>
        <div className="side-nav-header"></div>
        <div className="side-nav-body">
          <SidebarMenu />
        </div>
      </div>
      <div className="app-bar">
        <button className="app-bar-side-nav-btn" onClick={onAppBarSideNavClicked}>
          <i className="icon-menu"></i>
        </button>
        <a className="app-bar-brand" href="/">
          <img className="app-bar-logo" src="/assets/images/app_bar_logo.png" alt="Density Logo" />
        </a>
        <div className="app-bar-nav app-bar-nav-right">
          <button className="button button-inverse" onClick={onLogOutClicked}>Log Out</button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  sideNavOpen: state.appbar.sideNavOpen
});

const mapDispatchToProps = dispatch => ({
  onAppBarSideNavClicked: () => {
    dispatch(sideNavToggle());
  },
  onLogOutClicked: () => {
    dispatch(logoutUser());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Appbar);