import styles from './styles.module.scss';

import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarSection,
  AppScrollView,
  Icons,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  ListViewClickableLink,
} from '@density/ui';

import robinIcon from '../../assets/images/icon-robin.svg';
import googleCalendarIcon from '../../assets/images/icon-google-calendar.svg';
import slackIcon from '../../assets/images/icon-slack.svg';
import teemIcon from '../../assets/images/icon-teem.svg';
import outlookIcon from '../../assets/images/icon-outlook.svg';
import colorVariables from '@density/ui/variables/colors.json';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import { DensityService } from '../../types';

import IntegrationsRobinCreateModal from '../admin-integrations-robin-create-modal';
import IntegrationsRobinUpdateModal from '../admin-integrations-robin-update-modal';
import IntegrationsServiceDestroyModal from '../admin-integrations-service-destroy-modal';

import collectionServiceAuthorizationCreate from '../../actions/collection/service-authorizations/create';
import { collectionServiceAuthorizationUpdate, collectionServiceAuthorizationMakeDefault } from '../../actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../actions/collection/service-authorizations/destroy';

import doGoogleCalendarAuthRedirect from '../../actions/integrations/google-calendar';
import doOutlookAuthRedirect from '../../actions/integrations/outlook';


function iconForIntegration(serviceName: string) {
  switch(serviceName) {
    case "google_calendar":
      return googleCalendarIcon;
    case "outlook":
      return outlookIcon;
    case "robin":
      return robinIcon;
    case "slack":
      return slackIcon;
    case "teem":
      return teemIcon;
    default:
      return "";
  }
}

function activateEditLink(item, onClick) {
  if (!item.serviceAuthorization.id) {
    return <ListViewClickableLink onClick={onClick}>Activate</ListViewClickableLink>;
  }
  if (item.name === "robin") {
    return <ListViewClickableLink onClick={onClick}>Edit</ListViewClickableLink>;
  }
}

function handleActivateEditClick(item, onOpenModal) {
  if (item.name === "teem" && !item.serviceAuthorization.id) {
     window.location.href = `https://app.teem.com/oauth/authorize/?client_id=${process.env.REACT_APP_TEEM_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_TEEM_REDIRECT_URL}&response_type=code&scope=reservations`;
  } else if (item.name === "google_calendar" && !item.serviceAuthorization.id) {
    return doGoogleCalendarAuthRedirect();
  } else if (item.name === "outlook" && !item.serviceAuthorization.id) {
    return doOutlookAuthRedirect();
  } else {
    onOpenModal(!item.serviceAuthorization.id ? 'integrations-robin-create' : 'integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: false})
  }
}

function handleDeleteClick(item, onOpenModal) {
  if (item.name === "teem" || item.name === "google_calendar" || item.name === 'outlook') {
    onOpenModal('integrations-service-destroy', {serviceAuthorization: item.serviceAuthorization});
  } else {
    onOpenModal('integrations-robin-update', {serviceAuthorization: item.serviceAuthorization, isDestroying: true});
  }
}


export function AdminIntegrations({
  activeModal,
  integrations,
  onOpenModal,
  onMakeServiceAuthorizationDefault,
  onCreateServiceAuthorizationRobin,
  onUpdateServiceAuthorizationRobin,
  onDestroyServiceAuthorization,
  onCloseModal,
}) {
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

    <AppBar>
      <AppBarSection>
       Looking for a different integration? Contact us&nbsp;
       <a href="mailto:contact@density.io" target="_blank" rel="noopener noreferrer">contact@density.io</a>
      </AppBarSection>
    </AppBar>

    <AppScrollView backgroundColor={colorVariables.grayLightest}>
      <div className={styles.adminIntegrationsRoomBookingList}>
        <div className={styles.adminIntegrationsSectionHeader}>Room Booking</div>
        <ListView keyTemplate={item => item.displayName} data={integrations.services.filter(integration => integration.category === 'Room Booking') as Array<DensityService>}>
          <ListViewColumn
            id="Service"
            width={80}
            template={item => (
              <img src={iconForIntegration(item.name)} className={styles.adminIntegrationsListviewImage} alt="Integration Icon" />
            )}
          />
          <ListViewColumn
            id="Name"
            width={170}
            template={item => (
              <span className={styles.adminIntegrationsListviewValue}><strong>{item.displayName}</strong></span>
            )}
          />
          <ListViewColumn
            id="Added by"
            width={170}
            template={item => item.serviceAuthorization.id != null ? (
              <span className={styles.adminIntegrationsListviewValue}>{item.serviceAuthorization.user.fullName}</span>) : null
            }
          />
          <ListViewColumn
            id="Default service"
            width={120}
            template={item => {
              if(item.serviceAuthorization && item.serviceAuthorization.default === true) {
                return <span className={styles.adminIntegrationsListviewValue}>Default</span>
              } else if (item.serviceAuthorization && item.serviceAuthorization.id != null && item.serviceAuthorization.default === false) {
                return <ListViewClickableLink>Make default</ListViewClickableLink>
              } else {
                return null;
              }
            }} 
            onClick={item => onMakeServiceAuthorizationDefault(item.serviceAuthorization.id)}
          />          
          <ListViewColumnSpacer />
          <ListViewColumn
            id="Space Mappings"
            title=" "
            width={150}
            template={item => !item.serviceAuthorization.id ? null : <ListViewClickableLink>Space mappings</ListViewClickableLink>}
            onClick={item => window.location.href = `#/admin/integrations/${item.name}/space-mappings`}
          />
          <ListViewColumn
            id="Activate/Edit"
            title=" "
            width={90}
            align="right"
            template={item => activateEditLink(item, item => handleActivateEditClick(item, onOpenModal))}
          />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            align="right"
            template={item => !item.serviceAuthorization.id ? null : <Icons.Trash
              color={colorVariables.grayDarker}
              onClick={item => handleDeleteClick(item, onOpenModal)}
            />}
           />

        </ListView>
      </div>
      <div className={styles.adminIntegrationsChatList}>
        <div className={styles.adminIntegrationsSectionHeader}>Chat</div>
        <ListView keyTemplate={item => item.displayName} data={integrations.services.filter(integration => integration.category === 'Chat') as Array<DensityService>}>
          <ListViewColumn
            id="Service"
            width={80}
            template={item => (
              <img src={iconForIntegration(item.name)} className={styles.adminIntegrationsListviewImage} alt="Integration Icon" />
            )}
          />
          <ListViewColumn
            id="Name"
            width={170}
            template={item => (
              <span className={styles.adminIntegrationsListviewValue}><strong>{item.displayName}</strong></span>
            )}
          />
          <ListViewColumn
            id="Added by"
            width={170}
            template={item => item.serviceAuthorization.id != null ? (
              <span className={styles.adminIntegrationsListviewValue}>{item.serviceAuthorization.user.fullName}</span>) : null
            }
          />
          <ListViewColumnSpacer />
          <ListViewColumn
            id="Activate/Edit"
            title=" "
            width={90}
            template={item => !item.serviceAuthorization.id ? <ListViewClickableLink>Activate</ListViewClickableLink> : null }
            onClick={item => {
              if (!item.serviceAuthorization.id) {
                window.location.href = `https://slack.com/oauth/authorize?client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&scope=channels:read chat:write:bot&redirect_uri=${process.env.REACT_APP_SLACK_REDIRECT_URL}` 
              }
            }}
          />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            template={item => !item.serviceAuthorization.id ? null : <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('integrations-service-destroy', {serviceAuthorization: item.serviceAuthorization})}
          />
        </ListView>
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
    onMakeServiceAuthorizationDefault(serviceAuthorizationId) {
      dispatch<any>(collectionServiceAuthorizationMakeDefault(serviceAuthorizationId));
    },
  }
})(AdminIntegrations);
