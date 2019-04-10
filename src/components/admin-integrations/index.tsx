import styles from './styles.module.scss';

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

import Toaster from '../toaster/index';

import Dialogger from '../dialogger';
import ListView, { ListViewColumn, ListViewClickableLink } from '../list-view';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import { DensityService } from '../../types';

import IntegrationsRobinCreateModal from '../admin-integrations-robin-create-modal';
import IntegrationsRobinUpdateModal from '../admin-integrations-robin-update-modal';
import IntegrationsServiceDestroyModal from '../admin-integrations-service-destroy-modal';

import collectionServiceAuthorizationCreate from '../../actions/collection/service-authorizations/create';
import collectionServiceAuthorizationUpdate from '../../actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../actions/collection/service-authorizations/destroy';


export function AdminIntegrations({
  activeModal,
  integrations,
  onOpenModal,
  onCreateServiceAuthorizationRobin,
  onUpdateServiceAuthorizationRobin,
  onDestroyServiceAuthorization,
  onCloseModal,
}) {

  function iconForIntegration(serviceName) {
    switch(serviceName) {
      case "robin":
        return robinIcon;
      case "google_calendar":
        return googleCalendarIcon
      case "teem":
        return teemIcon
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
      onDestroyServiceAuthorization={onDestroyServiceAuthorization}
    /> : null}

    {activeModal.name === 'integrations-service-destroy' ? <IntegrationsServiceDestroyModal
      visible={activeModal.visible}
      initialServiceAuthorization={activeModal.data.serviceAuthorization}
      error={integrations.error}
      loading={integrations.loading}

      onDismiss={onCloseModal}
      onDestroyServiceAuthorization={onDestroyServiceAuthorization}
    /> : null}

    <Toaster />

    <AppBar>
      <AppBarSection>
       Looking for a different integration? Contact us&nbsp;
       <a href="mailto:contact@density.io" target="_blank">contact@density.io</a>
      </AppBarSection>
    </AppBar>

    <AppScrollView>
      <div className={styles.adminIntegrationsRoomBookingList}>
        <div className={styles.adminIntegrationsSectionHeader}>Room Booking</div>
          <ListView keyTemplate={item => item.displayName} data={integrations.services as Array<DensityService>}>
            <ListViewColumn title="Name" template={item => (
              <img src={iconForIntegration(item.name)} className={styles.adminIntegrationsListviewImage} />
            )} />
            <ListViewColumn title="" template={item => (
              <span className={styles.adminIntegrationsListviewValue}><strong>{item.displayName}</strong></span>
            )} />
            <ListViewColumn title="Added By" template={item => item.serviceAuthorization.id != null ? (
              <span className={styles.adminIntegrationsListviewValue}>{item.serviceAuthorization.user.fullName}</span>) : null
            } />
            <ListViewColumn title="Default Service" template={item => {
              if(item.serviceAuthorization && item.serviceAuthorization.default === true) {
                return <span className={styles.adminIntegrationsListviewValue}>Default</span>
              } else if (item.serviceAuthorization && item.serviceAuthorization.id != null && item.serviceAuthorization.default === false) {
                return <span className={styles.adminIntegrationsListviewValue}>Make Default turn into link</span>
              } else {
                return null;
              }
            }} />          
            <ListViewColumn flexGrow={1} flexShrink={1} />
            <ListViewColumn
              template={item => item.serviceAuthorization.id == null ? 
                <ListViewClickableLink>Activate</ListViewClickableLink> :
                <ListViewClickableLink>Edit</ListViewClickableLink>}
              onClick={item => {
                if (item.name == "teem") {
                  item.serviceAuthorization.id == null ? window.location.href = `https://app.teem.com/oauth/authorize/?client_id=${process.env.REACT_APP_TEEM_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_TEEM_REDIRECT_URL}&response_type=code&scope=reservations` : null;
                } else {
                  onOpenModal(item.serviceAuthorization.id == null ? 'integrations-robin-create' : 'integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: false})
                }
              }}
            />
            <ListViewColumn
              template={item => item.serviceAuthorization.id == null ? null : <Icons.Trash color={colorVariables.grayDarker} />}
              onClick={item => {
                if (item.name == "teem") {
                  onOpenModal('integrations-service-destroy', {serviceAuthorization: item.serviceAuthorization})
                } else {
                  onOpenModal('integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: true})} 
                }
              }
             />

          </ListView>
      </div>
      <div className={styles.adminIntegrationsChatList}>
        <div className={styles.adminIntegrationsSectionHeader}>Chat</div>
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
    onDestroyServiceAuthorization(serviceAuthorizationId) {
      dispatch<any>(collectionServiceAuthorizationDestroy(serviceAuthorizationId)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
  }
})(AdminIntegrations);
