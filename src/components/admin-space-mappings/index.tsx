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
} from '@density/ui/src';

import colorVariables from '@density/ui/variables/colors.json';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import Toaster from '../toaster/index';

import integrationServicesList from '../../rx-actions/integrations/services';
import collectionSpaceMappingsCreate from '../../rx-actions/collection/space-mappings/create-update';
import collectionSpaceMappingsDestroy from '../../rx-actions/collection/space-mappings/destroy';

import SpaceMappingsCreateUpdateModal from '../admin-space-mappings-create-update-modal/index';
import SpaceMappingsDestroyModal from '../admin-space-mappings-destroy-modal/index';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
import IntegrationsStore from '../../rx-stores/integrations';



export class AdminSpaceMappings extends React.Component<any, any> {
  private interval: any = null;

  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.props.currentService.service_authorization.last_sync === null) {
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

      onOpenModal,
      onCloseModal,
      onSaveSpaceMapping,
      onDestroySpaceMapping,
    } = this.props;

    const conferenceRooms = spaces.filter(space => ["conference_room", "meeting_room"].includes(space['function']))

    const serviceSpaceForService = (space_mappings, service) => {
      if (service) {
        const spaceMappingsForService = space_mappings.filter(spm => spm.service_id === service.id);
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
        initialServiceSpaceId={activeModal.data.service_space_id}
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
         <a href="mailto:contact@density.io" target="_blank" rel="noopener noreferrer">contact@density.io</a>
        </AppBarSection>
      </AppBar>

      <AppScrollView backgroundColor={colorVariables.gray000}>
        <div className={styles.adminIntegrationsList}>
          <div className={styles.adminIntegrationsSectionHeader}>Link your room-booking spaces</div>
          
          {currentService && currentService.service_authorization.last_sync === null ? (
            <div className={styles.centeredMessage}>
              <div className={styles.integrationNotice}>
                We are syncing your {currentService.display_name} spaces with Density for the first time. This will take between 2-5 minutes.
              </div>
            </div>
          ) : null}

          {currentService && currentService.service_authorization.last_sync !== null ? (
            <ListView keyTemplate={space => space.name} data={conferenceRooms as Array<CoreSpace>}>
              <ListViewColumn
                id="Density Conference Room"
                width={360}
                template={space => (
                  <span className={styles.adminIntegrationsListviewValue}>
                    {space.ancestry.length ? <Fragment>{space.ancestry[0].name} > </Fragment> : null}
                    <strong>{space.name}</strong>
                  </span>
                )}
              />
              <ListViewColumnSpacer />
              <ListViewColumn
                id={currentService ? `${currentService.display_name} Space` : "..."}
                width={240}
                template={space => {
                  const serviceSpace = serviceSpaceForService(space.space_mappings, currentService)
                  if (serviceSpace) {
                    return <ListViewClickableLink>{serviceSpace.serviceSpaceName}</ListViewClickableLink>
                  } else {
                    return <ListViewClickableLink>Assign to space...</ListViewClickableLink>
                  }
                }}
                onClick={space => onOpenModal('space-mappings-create-update', {
                  space: space, 
                  service_space_id: space.space_mappings.length > 0 ? space.space_mappings[0].service_space_id : null
                })}
              />
              <ListViewColumn
                id="Meeting Analytics"
                width={160}
                template={space => {
                  if (space.space_mappings.length > 0) {
                    return <ListViewClickableLink
                      onClick={() => window.location.href = `/#/spaces/${space.id}/meetings/${currentService.name}`}
                    >
                      View
                    </ListViewClickableLink>
                  } else {
                    return null;
                  }
                }}
              />
              <ListViewColumn
                id="Delete"
                title=" "
                width={30}
                align="right"
                template={space => {
                  if (space.space_mappings.length > 0) {
                    return <ListViewClickableLink
                      onClick={() => onOpenModal('space-mappings-destroy', {spaceMappingId: space.space_mappings[0].id})}
                    >
                      <Icons.Trash color={colorVariables.gray500} />
                    </ListViewClickableLink>
                  } else {
                    return null;
                  }
                }}
               />
            </ListView>
          ) : <div>Loading your room-booking spaces...</div>}
        </div>
      </AppScrollView>
    </Fragment>;
  }
}


const ConnectedAdminSpaceMappings: React.FC = () => {

  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore)
  const spacesState = useRxStore(SpacesLegacyStore);
  const integrations = useRxStore(IntegrationsStore);

  // FIXME: the state shape could be improved...
  const spaceMappingsPage = integrations.spaceMappingsPage;
  const currentService = integrations.spaceMappingsPage.service;

  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }
  const onCloseModal = async () => {
    await hideModal(dispatch);
  }
  const onSaveSpaceMapping = async (serviceMappingData) => {
    const { service_space_id, space_id, service_id } = serviceMappingData;
    const ok = await collectionSpaceMappingsCreate(dispatch, service_space_id, space_id, service_id);
    if (ok) { await hideModal(dispatch); }
  }
  const onDestroySpaceMapping = async (spaceMappingId) => {
    const ok = await collectionSpaceMappingsDestroy(dispatch, spaceMappingId);
    if (ok) { await hideModal(dispatch); }
  }

  const onCheckForIntegrationLastSync = async () => {
    await integrationServicesList(dispatch);
  }

  return (
    <AdminSpaceMappings
      
      spaces={spacesState.data}
      spaceMappingsPage={spaceMappingsPage}
      currentService={currentService}

      activeModal={activeModal}
      
      onOpenModal={onOpenModal}
      onCloseModal={onCloseModal}
      onSaveSpaceMapping={onSaveSpaceMapping}
      onDestroySpaceMapping={onDestroySpaceMapping}
      onCheckForIntegrationLastSync={onCheckForIntegrationLastSync}
    />
  )
}
export default ConnectedAdminSpaceMappings;
