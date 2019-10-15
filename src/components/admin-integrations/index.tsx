import styles from './styles.module.scss';

import React, { Fragment } from 'react';

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
import condecoIcon from '../../assets/images/icon-condeco.svg';
import colorVariables from '@density/ui/variables/colors.json';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';

import { DensityService } from '../../types';

import IntegrationsRobinCreateModal from '../admin-integrations-robin-create-modal';
import IntegrationsServiceDestroyModal from '../admin-integrations-service-destroy-modal';

import collectionServiceAuthorizationCreate from '../../rx-actions/collection/service-authorizations/create';
import { collectionServiceAuthorizationUpdate, collectionServiceAuthorizationMakeDefault } from '../../rx-actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../rx-actions/collection/service-authorizations/destroy';

import doGoogleCalendarAuthRedirect from '../../rx-actions/integrations/google-calendar';
import doOutlookAuthRedirect from '../../rx-actions/integrations/outlook';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import IntegrationsStore from '../../rx-stores/integrations';


function iconForIntegration(serviceName: string) {
  const iconMap = {
    google_calendar: googleCalendarIcon,
    outlook: outlookIcon,
    robin: robinIcon,
    slack: slackIcon,
    teem: teemIcon,
    condeco: condecoIcon
  };

  return iconMap[serviceName] || "";
}

function activateLink(item, onClick) {
  if (!item.serviceAuthorization.id && item.name !== 'condeco') {
    return <ListViewClickableLink onClick={onClick}>Activate</ListViewClickableLink>;
  }
}

function handleActivateClick(item, onOpenModal) {
  if (item.name === "teem" && !item.serviceAuthorization.id) {
     window.location.href = `https://app.teem.com/oauth/authorize/?client_id=${process.env.REACT_APP_TEEM_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_TEEM_REDIRECT_URL}&response_type=code&scope=reservations`;
  } else if (item.name === "google_calendar" && !item.serviceAuthorization.id) {
    return doGoogleCalendarAuthRedirect();
  } else if (item.name === "outlook" && !item.serviceAuthorization.id) {
    return doOutlookAuthRedirect();
  } else if (item.name === "robin" && !item.serviceAuthorization.id) {
    onOpenModal('integrations-robin-create', {serviceAuthorization: item.serviceAuthorization})
  }
}

export function AdminIntegrations({
  activeModal,
  integrations,
  onOpenModal,
  onMakeServiceAuthorizationDefault,
  onCreateServiceAuthorizationRobin,
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
            onClick={item => {
              if (item.serviceAuthorization.id) {
                window.location.href = `#/admin/integrations/${item.name}/space-mappings`
              }
            }}
          />
          <ListViewColumn
            id="Activate/Edit"
            title=" "
            width={90}
            align="right"
            template={item => activateLink(
              item,
              () => handleActivateClick(item, onOpenModal)
            )}
          />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            align="right"
            template={item => (
              !item.serviceAuthorization.id ?
                null :
                <ListViewClickableLink onClick={() => onOpenModal('integrations-service-destroy', {serviceAuthorization: item.serviceAuthorization})}>
                  <Icons.Trash color={colorVariables.grayDarker} />
                </ListViewClickableLink>
            )}
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
            align="right"
            template={item => !item.serviceAuthorization.id ? <ListViewClickableLink>Activate</ListViewClickableLink> : null }
            onClick={item => {
              if (!item.serviceAuthorization.id) {
                window.location.href = `https://slack.com/oauth/authorize?client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&scope=bot,chat:write:bot&redirect_uri=${process.env.REACT_APP_SLACK_REDIRECT_URL}` 
              }
            }}
          />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            align="right"
            template={item => !item.serviceAuthorization.id ? null : <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('integrations-service-destroy', {serviceAuthorization: item.serviceAuthorization})}
          />
        </ListView>
      </div>
      
    </AppScrollView>
  </Fragment>;
}


const ConnectedAdminIntegrations: React.FC = () => {

  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const integrations = useRxStore(IntegrationsStore);

  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }

  const onCloseModal = async () => {
    await hideModal(dispatch);
  }

  const onCreateServiceAuthorizationRobin = async (serviceAuthorization) => {
    const ok = await collectionServiceAuthorizationCreate(dispatch, 'robin', serviceAuthorization);
    if (ok) { hideModal(dispatch); }
  }

  const onDestroyServiceAuthorization = async (serviceAuthorizationId) => {
    const ok = await collectionServiceAuthorizationDestroy(dispatch, serviceAuthorizationId);
    if (ok) { hideModal(dispatch); }
  }

  const onMakeServiceAuthorizationDefault = async (serviceAuthorizationId) => {
    await collectionServiceAuthorizationMakeDefault(dispatch, serviceAuthorizationId);
  }

  return (
    <AdminIntegrations
      activeModal={activeModal}
      integrations={integrations}
      onOpenModal={onOpenModal}
      onCloseModal={onCloseModal}
      onCreateServiceAuthorizationRobin={onCreateServiceAuthorizationRobin}
      onDestroyServiceAuthorization={onDestroyServiceAuthorization}
      onMakeServiceAuthorizationDefault={onMakeServiceAuthorizationDefault}
    />
  )
}
export default ConnectedAdminIntegrations;
