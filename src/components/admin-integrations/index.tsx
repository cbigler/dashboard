import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarSection,
  AppScrollView,
  Button,
  Icons
} from '@density/ui';

import robinIcon from '../../assets/images/icon-robin.svg';
import googleCalendarIcon from '../../assets/images/icon-google-calendar.svg';
import teemIcon from '../../assets/images/icon-teem.svg';
import colorVariables from '@density/ui/variables/colors.json';

import Dialogger from '../dialogger';
import ListView, { ListViewColumn, LIST_CLICKABLE_STYLE } from '../list-view';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import showToast from '../../actions/toasts';

import { DensityService } from '../../types';

import IntegrationsRobinCreateModal from '../admin-integrations-robin-create-modal';
import IntegrationsRobinUpdateModal from '../admin-integrations-robin-update-modal';

import collectionServiceAuthorizationCreate from '../../actions/collection/service-authorizations/create';
import collectionServiceAuthorizationUpdate from '../../actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../actions/collection/service-authorizations/destroy';


export function AdminIntegrations({
  activeModal,
  integrations,
  onOpenModal,
  onCreateServiceAuthorizationRobin,
  onUpdateServiceAuthorizationRobin,
  onDestroyServiceAuthorizationRobin,
  onCloseModal,
}) {

  function iconForIntegration(serviceName) {
    switch(serviceName) {
      case "robin":
        return robinIcon;
      case "google_calendar":
        return googleCalendarIcon
      default:
        return "";
    }
  }

  return <Fragment>
    {activeModal.name === 'integrations-robin-create' ? <IntegrationsRobinCreateModal
      visible={activeModal.visible}
      error={integrations.error}
      loading={integrations.loading}

      onSubmit={onCreateServiceAuthorizationRobin}
      onDismiss={onCloseModal}
    /> : null}

    {activeModal.name === 'integrations-robin-update' ? <IntegrationsRobinUpdateModal
      visible={activeModal.visible}
      initialServiceAuthorization={activeModal.data.serviceAuthorization}
      isDestroying={activeModal.data.isDestroying}
      error={integrations.error}
      loading={integrations.loading}

      onSubmit={onUpdateServiceAuthorizationRobin}
      onDismiss={onCloseModal}
      onDestroyServiceAuthorizationRobin={onDestroyServiceAuthorizationRobin}
    /> : null}

    <AppBar>
      <AppBarSection>
       Looking for a different integration? Contact us&nbsp;
       <a href="mailto:contact@density.io" target="_blank">contact@density.io</a>
      </AppBarSection>
    </AppBar>

    <AppScrollView>
      <div className="admin-integrations-room-booking-list">
        <div className="admin-integrations-section-header">Room Booking</div>
          <ListView keyTemplate={item => item.displayName} data={integrations.services as Array<DensityService>}>
            <ListViewColumn title="Name" template={item => (
              <img src={iconForIntegration(item.name)} className="admin-integrations-listview-image" />
            )} />
            <ListViewColumn title="" template={item => (
              <span className="admin-integrations-listview-value"><strong>{item.displayName}</strong></span>
            )} />
            <ListViewColumn title="Added By" template={item => item.serviceAuthorization.id != null ? (
              <span className="admin-integrations-listview-value">{item.serviceAuthorization.user.fullName}</span>) : null
            } />
            <ListViewColumn title="Default Service" template={item => (
              <span className="admin-integrations-listview-value">{item.serviceAuthorization && item.serviceAuthorization.default == true ? "Default" : ""}</span>
            )} />
            <ListViewColumn style={{flexGrow: 1, flexShrink: 1}} />
            <ListViewColumn
            template={item => item.serviceAuthorization.id == null ? <span style={LIST_CLICKABLE_STYLE}>Activate</span> : <span style={LIST_CLICKABLE_STYLE}>Edit</span>}
            onClick={item => onOpenModal(item.serviceAuthorization.id == null ? 'integrations-robin-create' : 'integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: false})} />
            <ListViewColumn
              template={item => item.serviceAuthorization.id == null ? null : <Icons.Trash color={colorVariables.grayDarker} />}
              onClick={item => onOpenModal('integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: true})} />
          </ListView>
      </div>
      <div className="admin-integrations-chat-list">
        <div className="admin-integrations-section-header">Chat</div>
      </div>
    </AppScrollView>
  </Fragment>;
}

export default connect((state: any) => {
  return {
    integrations: state.integrations,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
    onCreateServiceAuthorizationRobin(serviceAuthorization) {
       dispatch<any>(collectionServiceAuthorizationCreate('robin', serviceAuthorization)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onUpdateServiceAuthorizationRobin(serviceAuthorization) {
      dispatch<any>(collectionServiceAuthorizationUpdate('robin', serviceAuthorization)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onDestroyServiceAuthorizationRobin(serviceAuthorizationId) {
      dispatch<any>(collectionServiceAuthorizationDestroy(serviceAuthorizationId)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
  }
})(AdminIntegrations);
