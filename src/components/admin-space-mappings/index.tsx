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
import slackIcon from '../../assets/images/icon-slack.svg';
import teemIcon from '../../assets/images/icon-teem.svg';
import colorVariables from '@density/ui/variables/colors.json';

import { DensitySpaceMapping, DensityServiceSpace, DensitySpace } from '../../types';
import Toaster from '../toaster/index';

import integrationServicesList from '../../actions/integrations/services';
import collectionSpaceMappingsCreate from '../../actions/collection/space-mappings/create-update';
import collectionSpaceMappingsDestroy from '../../actions/collection/space-mappings/destroy';

import ListView, { ListViewColumn, ListViewClickableLink } from '../list-view';

import SpaceMappingsCreateUpdateModal from '../admin-space-mappings-create-update-modal/index';
import SpaceMappingsDestroyModal from '../admin-space-mappings-destroy-modal/index';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';



export class AdminSpaceMappings extends React.Component<any, any> {
  private interval: any = null;

  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.props.currentService.serviceAuthorization.lastSync === null) {
        this.props.onCheckForIntegrationLastSync();
      }
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      activeModal,
      spaces,
      spaceMappingsPage,
      currentService,

      onCheckForIntegrationLastSync,
      onOpenModal,
      onCloseModal,
      onSaveSpaceMapping,
      onDestroySpaceMapping,
    } = this.props;

    const conferenceRooms = spaces.filter(space => ["conference_room", "meeting_room"].includes(space['function']))

    const serviceSpaceForService = (spaceMappings, service) => {
      if (service) {
        const spaceMappingsForService = spaceMappings.filter(spm => spm.serviceId == service.id);
        if (spaceMappingsForService) {
          return spaceMappingsForService[0];
        }
      }
      return null;
    }

    return <Fragment>

      {activeModal.name === 'space-mappings-create-update' ? <SpaceMappingsCreateUpdateModal
        visible={activeModal.visible}
        error={spaceMappingsPage.error}
        loading={spaceMappingsPage.loading}
        service={currentService}
        serviceSpaces={spaceMappingsPage.serviceSpaces}
        initialServiceSpaceId={activeModal.data.serviceSpaceId}
        space={activeModal.data.space}

        onSubmit={onSaveSpaceMapping}
        onDismiss={onCloseModal}
      /> : null}

      {activeModal.name === 'space-mappings-destroy' ? <SpaceMappingsDestroyModal
        visible={activeModal.visible}
        error={spaceMappingsPage.error}
        spaceMappingId={activeModal.data.spaceMappingId}

        onDestroy={onDestroySpaceMapping}
        onDismiss={onCloseModal}
      /> : null}
     
      <Toaster />

      <AppBar>
        <AppBarSection>
         Looking for a different integration? Contact us&nbsp;
         <a href="mailto:contact@density.io" target="_blank">contact@density.io</a>
        </AppBarSection>
      </AppBar>

      <AppScrollView backgroundColor={colorVariables.grayLightest}>
        <div className={styles.adminIntegrationsList}>
          <div className={styles.adminIntegrationsSectionHeader}>Link your room-booking spaces</div>
          
          {currentService && currentService.serviceAuthorization.lastSync === null ? (
            <div className={styles.centeredMessage}>
              <div className={styles.integrationNotice}>
                We are syncing your {currentService.displayName} spaces with Density. This page will automatically refresh when the sync is complete.
              </div>
            </div>
          ) : null}

          {currentService && currentService.serviceAuthorization.lastSync !== null ? (
            <ListView keyTemplate={space => space.name} data={conferenceRooms as Array<DensitySpace>}>
              <ListViewColumn title="Density Conference Room" template={space => (
                <span className={styles.adminIntegrationsListviewValue}>{space.ancestry[0].name} > <strong>{space.name}</strong></span>
              )} />
              <ListViewColumn flexGrow={1} flexShrink={1} />
              <ListViewColumn 
                title={currentService ? `${currentService.displayName} Space` : "..."} 
                template={space => {
                  const serviceSpace = serviceSpaceForService(space.spaceMappings, currentService)
                  if (serviceSpace) {
                    return <ListViewClickableLink>{serviceSpace.serviceSpaceName}</ListViewClickableLink>
                  } else {
                    return <ListViewClickableLink>Assign to space...</ListViewClickableLink>
                  }
                }}
                onClick={space => onOpenModal('space-mappings-create-update', {
                  space: space, 
                  serviceSpaceId: space.spaceMappings.length > 0 ? space.spaceMappings[0].serviceSpaceId : null
                })}
              />
              <ListViewColumn 
                title="Meeting Analytics" 
                template={space => {
                  if (space.spaceMappings.length > 0) {
                    return <ListViewClickableLink>View</ListViewClickableLink>
                  } else {
                    return null;
                  }
                }}
                onClick={space => window.location.href = `/#/spaces/explore/${space.id}/meetings/${currentService.name}`}
              />
              <ListViewColumn
                template={space => {
                  if (space.spaceMappings.length > 0) {
                    return <Icons.Trash color={colorVariables.grayDarker} />
                  } else {
                    return null;
                  }
                }}
                onClick={space => onOpenModal('space-mappings-destroy', {spaceMappingId: space.spaceMappings[0].id})}
               />
            </ListView>
          ) : <div>Loading your room-booking spaces...</div>}
        </div>
      </AppScrollView>
    </Fragment>;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces.data,
    spaceMappingsPage: state.integrations.spaceMappingsPage,
    currentService: state.integrations.spaceMappingsPage.service,
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
    onSaveSpaceMapping(serviceMappingData) {
      const { serviceSpaceId, spaceId, serviceId } = serviceMappingData;
      dispatch<any>(collectionSpaceMappingsCreate(serviceSpaceId, spaceId, serviceId)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onDestroySpaceMapping(spaceMappingId) {
      dispatch<any>(collectionSpaceMappingsDestroy(spaceMappingId)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onCheckForIntegrationLastSync() {
      dispatch<any>(integrationServicesList());
    }
  }
})(AdminSpaceMappings);
