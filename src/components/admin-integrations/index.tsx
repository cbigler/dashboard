import React, { Fragment, useState, useEffect } from 'react';
import styles from './styles.module.scss';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  AppScrollView,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  Modal,
  Skeleton,
  ListView,
  ListViewColumn,
} from '@density/ui/src';
import FormLabel from '../form-label';
import { SpacePickerDropdown } from '../space-picker';
import { spaceHierarchyFormatter } from '@density/lib-space-helpers';

import Status from './status';
import EmptyCard from './empty-card';

import robinIcon from '../../assets/images/icon-robin.svg';
import googleCalendarIcon from '../../assets/images/icon-google-calendar.svg';
import slackIcon from '../../assets/images/icon-slack.svg';
import teemIcon from '../../assets/images/icon-teem.svg';
import outlookIcon from '../../assets/images/icon-outlook.svg';
import condecoIcon from '../../assets/images/icon-condeco.svg';
import brivoIcon from '../../assets/images/icon-brivo.svg';
import colorVariables from '@density/ui/variables/colors.json';

import updateModal from '../../rx-actions/modal/update';
import { showToast } from '../../rx-actions/toasts';
import doGoogleCalendarAuthRedirect from '../../rx-actions/integrations/google-calendar';
import doOutlookAuthRedirect from '../../rx-actions/integrations/outlook';

import { DensityService } from '../../types';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
import { ResourceStatus } from '../../types/resource';

import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import filterCollection from '../../helpers/filter-collection';

import ActiveModalStore from '../../rx-stores/active-modal';
import IntegrationsStore from '../../rx-stores/integrations';
import {
  ServiceStatus,
  ServiceRenderingPreferences,
  SelectedService,

  DensitySpaceMappingWithStatus,
  DensityDoorwayMappingWithStatus,
} from '../../types/integrations';
import {
  integrationsActions,

  openService,
  closeService,

  servicesList,
  serviceAuthorizationDelete,
  serviceAuthorizationMakeDefault,

  spaceMappingsAdd,
  spaceMappingsUpdate,
  spaceMappingsDelete,
  doorwayMappingsAdd,
  doorwayMappingsUpdate,
  doorwayMappingsDelete,
} from '../../rx-actions/integrations';

import core from '../../client/core';
import fuzzy from 'fuzzy';

const filterServices = filterCollection({fields: ['display_name']});

const NEW_ROW = 'NEW_ROW';

function iconForIntegration(serviceName: string) {
  const iconMap = {
    'google_calendar': googleCalendarIcon,
    'outlook': outlookIcon,
    'robin': robinIcon,
    'slack': slackIcon,
    'teem': teemIcon,
    'condeco': condecoIcon,
    'brivo': brivoIcon
  };

  return iconMap[serviceName] || '';
}

function getServiceStatus(service: DensityService): ServiceStatus {
  let status: ServiceStatus = 'inactive';
  if (service.service_authorization.id) {
    status = 'active';
  }

  // TODO: somehow set error status sometimes too
  return status
}

const RobinActivationForm: React.FunctionComponent<{service: DensityService}> =  ({service}) => {
  const [ accessToken, setAccessToken ] = useState('');
  const [ organizationId, setOrganizationId ] = useState('');

  const dispatch = useRxDispatch();

  // Is this form being used to set up a new service, or to re-authorize an existing service?
  const isCreating = typeof service.service_authorization.id === 'undefined';

  async function onSubmit() {
    try {
      await core().post(`/integrations/robin/`, {
        "robin_access_token": accessToken,
        "robin_organization_id": organizationId,
      });
    } catch (err) {
      return false;
    }

    closeService(dispatch);

    servicesList(dispatch);
    showToast(dispatch, {
      text: `${isCreating ? 'Created' : 'Updated'} Robin Integration!`,
    });
  }

  return (
    <Fragment>
      <div className={styles.robinActivationForm}>
        <FormLabel
          label="Robin API Token"
          htmlFor="create-token"
          input={<InputBox
            type="text"
            id="create-token"
            width="100%"
            value={accessToken}
            onChange={e => setAccessToken(e.target.value)}
          />}
        />
        <FormLabel
          label="Robin Organization ID"
          htmlFor="create-organization-id"
          input={<InputBox
            type="text"
            id="create-organization-id"
            width="100%"
            value={organizationId}
            onChange={e => setOrganizationId(e.target.value)}
          />}
        />
      </div>
      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              {isCreating ? (
                <Button variant="underline" onClick={() => closeService(dispatch)}>Cancel</Button>
              ) : null}
              <Button
                variant="filled"
                onClick={() => {
                  let promise = Promise.resolve();

                  if (!isCreating) {
                    promise = core().delete(`/integrations/service_authorizations/${service.service_authorization.id}/`);
                  }

                  promise.then(() => onSubmit());
                }}
              >Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Fragment>
  );
}

const SERVICE_RENDERING_PREFERENCES: {[serviceName: string]: ServiceRenderingPreferences} = {
  // Room Booking
  'google_calendar': {
    activationProcess: {
      type: 'login',
      onClick: () => doGoogleCalendarAuthRedirect(),
    },
    spaceMappings: {
      enabled: true,
      serviceSpaceResourceName: 'Calendar',
    },
    doorwayMappings: {enabled: false},
  },
  'outlook': {
    activationProcess: {
      type: 'login',
      onClick: () => doOutlookAuthRedirect(),
    },
    spaceMappings: {
      enabled: true,
      serviceSpaceResourceName: 'Calendar',
    },
    doorwayMappings: {enabled: false},
  },
  'robin': {
    activationProcess: { type: 'form', component: RobinActivationForm },
    spaceMappings: {
      enabled: true,
      serviceSpaceResourceName: 'Space',
      welcomeInstructions: (
        <div>
          <h3>You haven't connected your Robin Spaces and Density Spaces</h3>
          <p>Please do this below.</p>
        </div>
      ),
    },
    doorwayMappings: {enabled: false},
  },
  'teem': {
    activationProcess: {
      type: 'login',
      onClick: () => {
        window.location.href = `https://app.teem.com/oauth/authorize/?client_id=${process.env.REACT_APP_TEEM_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_TEEM_REDIRECT_URL}&response_type=code&scope=reservations`;
      },
    },
    spaceMappings: {
      enabled: true,
      serviceSpaceResourceName: 'Space',
    },
    doorwayMappings: {enabled: false},
  },

  // Chat
  'slack': {
    activationProcess: {
      type: 'login',
      onClick: () => {
        window.location.href = `https://slack.com/oauth/authorize?client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&scope=bot,chat:write:bot&redirect_uri=${process.env.REACT_APP_SLACK_REDIRECT_URL}`;
      },
    },
    spaceMappings: { enabled: false, },
    doorwayMappings: { enabled: false },
  },

  // Access Control
  'brivo': {
    activationProcess: {
      type: 'login',
      onClick: async (service) => {
        const authUrl = await core().get(`/integrations/${service.name}/`);
        window.location.href = authUrl.data;
      }
    },
    spaceMappings: { enabled: false },
    doorwayMappings: {
      enabled: true,
      fetchServiceDoorways: async service => {
        const response = await core().get(`/integrations/brivo/sites/?page=1&page_size=5000`);
        const sites = response.data;
        const accessPointsBySite = await Promise.all(sites.map(async site => {
          const response = await core().get(`/integrations/brivo/sites/${site.id}/access_points/?page=1&page_size=5000`);
          return response.data.map(accessPoint => ({
            id: `${accessPoint.id}`,
            name: `${site.siteName}: ${accessPoint.name}`,
          }));
        }));
        return accessPointsBySite.flat();
      },
      serviceDoorwayResourceName: 'Access Point',
      welcomeInstructions: (
        <div className={styles.brivoWelcome}>
          <div>
            <h3>You haven't mapped any access points.</h3>
            <p>In order to set up your access control integration, you need to tie together Density Doorways and Brivo Access Points.</p>
          </div>
        </div>
      ),
    },
  },
};

// This applies to any services that are not specified in the above list.
const DEFAULT_SERVICE_RENDERING_PREFERENCES = {
  activationProcess: { type: 'support' },
  spaceMappings: { enabled: false },
  doorwayMappings: { enabled: false },
};

function getServiceRenderingPreferences(service: DensityService): ServiceRenderingPreferences {
  return SERVICE_RENDERING_PREFERENCES[service.name] || DEFAULT_SERVICE_RENDERING_PREFERENCES;
}

const IntegrationTypeTag: React.FunctionComponent<{}> = ({children}) => (
  <div className={styles.integrationTypeTag}>
    {children}
  </div>
);

const SpaceMappings: React.FunctionComponent<{selectedService: SelectedService, service: DensityService}> = ({selectedService, service}) => {
  const dispatch = useRxDispatch();
  const [searchText, setSearchText] = useState('');

  const serviceRenderingPreferences = getServiceRenderingPreferences(service);
  if (!serviceRenderingPreferences.spaceMappings.enabled) {
    return null;
  }

  const serviceSpaceResourceName = serviceRenderingPreferences.spaceMappings.serviceSpaceResourceName;

  const header = (
    <AppBarContext.Provider value="CARD_HEADER">
      <AppBar>
        <AppBarTitle>Space Mappings</AppBarTitle>
        <AppBarSection>
          {selectedService.doorwayMappings.status === ResourceStatus.COMPLETE && selectedService.doorwayMappings.data.doorwayMappings.length > 0 ? (
            <InputBox
              type="text"
              placeholder="Search for space mapping"
              leftIcon={<Icons.Search />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              width={300}
            />
          ) : null}
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
  );

  switch (selectedService.spaceMappings.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return (
      <Fragment>
        {header}
        <ListView
          padOuterColumns
          data={[{id: 1}, {id: 2}]}
        >
          <ListViewColumn
            id="Density Space"
            template={() => (
              <Skeleton width="100%" height={24} />
            )}
          />
          <ListViewColumn
            id="Arrow"
            title=" "
            template={() => (
              <Icons.ArrowRight color={colorVariables.gray400} />
            )}
            width={50}
          />
          <ListViewColumn
            id="Service Space"
            title={`${service.display_name} ${serviceSpaceResourceName}`}
            template={() => (
              <Skeleton width="100%" height={24} />
            )}
          />
          <ListViewColumn
            id="Actions"
            title=" "
            width={100}
            template={() => null}
          />
        </ListView>
      </Fragment>
    );

  case ResourceStatus.ERROR:
    return (
      <Fragment>
        {header}
        <p>Error</p>
      </Fragment>
    );

  case ResourceStatus.COMPLETE:
    const spaceHierarchy = spaceHierarchyFormatter(selectedService.spaceMappings.data.hierarchy);
    const serviceSpaceChoices = selectedService.spaceMappings.data.serviceSpaces
        .map(s => ({ id: s.service_space_id, label: s.name }));

    const spaceMappingsData = selectedService.spaceMappings.data;

    const newSpaceId = spaceMappingsData.newSpaceId,
          newServiceSpaceId = spaceMappingsData.newServiceSpaceId;

    const filterSpaceMappings = filterCollection({fields: [
      // Since the space mapping only has the ids, we have to look up the names in the
      // service space list and the space hierarchy.
      spaceMapping => {
        const result = spaceHierarchy.find(i => i.space.id === spaceMapping.space_id);
        return result ? result.space.name : '';
      },
      spaceMapping => {
        const result = serviceSpaceChoices.find(i => i.id === spaceMapping.service_space_id);
        return result ? result.label : '';
      },
    ]});

    return (
      <Fragment>
        {header}

        {/* If there are special instructions when no doorway mappings exist, render them */}
        {selectedService.spaceMappings.data.spaceMappings.length === 0 ? (
          serviceRenderingPreferences.spaceMappings.welcomeInstructions
        ) : null}

        <ListView
          padOuterColumns
          data={[
            ...filterSpaceMappings(selectedService.spaceMappings.data.spaceMappings, searchText),
            { id: NEW_ROW },
          ]}
        >
          <ListViewColumn
            id="Density Space"
            template={(spaceMapping: DensitySpaceMappingWithStatus) => (
              spaceMapping.id === NEW_ROW ? (
                <SpacePickerDropdown
                  placeholder="Select Density Space"
                  value={newSpaceId}
                  onChange={e => dispatch(integrationsActions.spaceMappingChangeNewSpaceId(e.space.id))}
                  formattedHierarchy={spaceHierarchy}
                  width="100%"
                />
              ) : (
                <SpacePickerDropdown
                  placeholder="Select Density Space"
                  value={spaceMapping.space_id}
                  onChange={e => dispatch(integrationsActions.spaceMappingUpdateChangeDensitySpaceId(spaceMapping.id, e.space.id))}
                  formattedHierarchy={spaceHierarchy}
                  width="100%"
                />
              )
            )}
          />
          <ListViewColumn
            id="Arrow"
            title=" "
            template={(spaceMapping: DensitySpaceMappingWithStatus) => (
              <Icons.ArrowRight color={colorVariables.gray400} />
            )}
            width={50}
          />
          <ListViewColumn
            id="Service Space"
            title={`${service.display_name} ${serviceSpaceResourceName}`}
            template={(spaceMapping: DensitySpaceMappingWithStatus) => (
              spaceMapping.id === NEW_ROW ? (
                <InputBox
                  type="select"
                  placeholder={`Select ${service.display_name} ${serviceSpaceResourceName}`}
                  choices={serviceSpaceChoices}
                  value={newServiceSpaceId}
                  onChange={e => dispatch(integrationsActions.spaceMappingChangeServiceSpaceId(e.id))}
                  width="100%"
                  menuMaxHeight={300}
                />
              ): (
                <InputBox
                  type="select"
                  choices={serviceSpaceChoices}
                  value={spaceMapping.service_space_id}
                  onChange={e => dispatch(integrationsActions.spaceMappingUpdateChangeServiceSpaceId(spaceMapping.id, e.id))}
                  width="100%"
                  menuMaxHeight={300}
                />
              )
            )}
          />
          <ListViewColumn
            id="Actions"
            title=" "
            width={100}
            template={(spaceMapping: DensitySpaceMappingWithStatus) => (
              spaceMapping.id === NEW_ROW ? (
                <Button
                  variant="filled"
                  disabled={newSpaceId === null || newServiceSpaceId === null}
                  onClick={() => spaceMappingsAdd(
                    dispatch,
                    service.id,
                    newSpaceId as string,
                    newServiceSpaceId as string
                  )}
                >
                  Create
                </Button>
              ) : (
                spaceMapping.status === 'DIRTY' ? (
                  <Button
                    variant="filled"
                    onClick={() => spaceMappingsUpdate(
                      dispatch,
                      spaceMapping.id,
                      spaceMapping.space_id,
                      spaceMapping.service_space_id,
                    )}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    variant="underline"
                    onClick={() => spaceMappingsDelete(dispatch, spaceMapping.id)}
                  >
                    Delete
                  </Button>
                )
              )
            )}
          />
        </ListView>
      </Fragment>
    );
  }
}

const DoorwayMappings: React.FunctionComponent<{selectedService: SelectedService, service: DensityService}> = ({selectedService, service}) => {
  const dispatch = useRxDispatch();
  const [searchText, setSearchText] = useState('');

  const serviceRenderingPreferences = getServiceRenderingPreferences(service);
  if (!serviceRenderingPreferences.doorwayMappings.enabled) {
    return null;
  }

  const serviceDoorwayResourceName = serviceRenderingPreferences.doorwayMappings.serviceDoorwayResourceName;

  const header = (
    <AppBarContext.Provider value="CARD_HEADER">
      <AppBar>
        <AppBarTitle>Doorway Mappings</AppBarTitle>
        <AppBarSection>
          {selectedService.doorwayMappings.status === ResourceStatus.COMPLETE && selectedService.doorwayMappings.data.doorwayMappings.length > 0 ? (
            <InputBox
              type="text"
              placeholder="Search for doorway mapping"
              leftIcon={<Icons.Search />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              width={300}
            />
          ) : null}
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
  );

  switch (selectedService.doorwayMappings.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return (
      <Fragment>
        {header}
        <ListView
          padOuterColumns
          data={[{id: 1}, {id: 2}]}
        >
          <ListViewColumn
            id="Density Doorway"
            template={() => (
              <Skeleton width="100%" height={24} />
            )}
          />
          <ListViewColumn
            id="Arrow"
            title=" "
            template={() => (
              <Icons.ArrowRight color={colorVariables.gray400} />
            )}
            width={50}
          />
          <ListViewColumn
            id="Service Doorway"
            title={`${service.display_name} ${serviceDoorwayResourceName}`}
            template={() => (
              <Skeleton width="100%" height={24} />
            )}
          />
          <ListViewColumn
            id="Actions"
            title=" "
            width={100}
            template={() => null}
          />
        </ListView>
      </Fragment>
    );

  case ResourceStatus.ERROR:
    return (
      <Fragment>
        {header}
        <p>Error</p>
      </Fragment>
    );

  case ResourceStatus.COMPLETE:
    const serviceDoorwayChoices = selectedService.doorwayMappings.data.serviceDoorways
        .map(d => ({id: d.id, label: d.name}));

    const doorwayChoices = selectedService.doorwayMappings.data.doorways.map(d => ({id: d.id, label: d.name}));

    const filterDoorwayMappings = filterCollection({fields: [
      // Since the doorway mapping only has the ids, we have to look up the names in the
      // service doorway list and the doorway list.
      (doorwayMapping: DensityDoorwayMappingWithStatus) => {
        const result = doorwayChoices.find(i => i.id === doorwayMapping.doorway_id);
        return result ? result.label : '';
      },
      (doorwayMapping: DensityDoorwayMappingWithStatus) => {
        const result = serviceDoorwayChoices.find(i => i.id === doorwayMapping.id);
        return result ? result.label : '';
      },
    ]});

    const doorwayMappingsData = selectedService.doorwayMappings.data;

    const newDoorwayId = doorwayMappingsData.newDoorwayId,
          newServiceDoorwayId = doorwayMappingsData.newServiceDoorwayId;

    return (
      <Fragment>
        {header}

        {/* If there are special instructions when no doorway mappings exist, render them */}
        {selectedService.doorwayMappings.data.doorwayMappings.length === 0 ? (
          serviceRenderingPreferences.doorwayMappings.welcomeInstructions
        ) : null}

        <ListView
          padOuterColumns
          data={[
            ...filterDoorwayMappings(selectedService.doorwayMappings.data.doorwayMappings, searchText),
            { id: NEW_ROW },
          ]}
        >
          <ListViewColumn
            id="Density Doorway"
            template={(doorwayMapping: DensityDoorwayMappingWithStatus) => (
              doorwayMapping.id === NEW_ROW ? (
                <InputBox
                  type="select"
                  placeholder="Select Density Doorway"
                  choices={doorwayChoices}
                  width="100%"
                  value={newDoorwayId}
                  onChange={e => dispatch(integrationsActions.doorwayMappingChangeNewDoorwayId(e.id))}
                  menuMaxHeight={300}
                />
              ) : (
                <InputBox
                  type="select"
                  placeholder="Select Density Doorway"
                  choices={doorwayChoices}
                  width="100%"
                  value={doorwayMapping.doorway_id}
                  onChange={e => dispatch(integrationsActions.doorwayMappingUpdateChangeDensityDoorwayId(doorwayMapping.id, e.id))}
                  menuMaxHeight={300}
                />
              )
            )}
          />
          <ListViewColumn
            id="Arrow"
            title=" "
            template={(doorwayMapping: DensityDoorwayMappingWithStatus) => (
              <Icons.ArrowRight color={colorVariables.gray400} />
            )}
            width={50}
          />
          <ListViewColumn
            id="Service Doorway"
            title={`${service.display_name} ${serviceDoorwayResourceName}`}
            template={(doorwayMapping: DensityDoorwayMappingWithStatus) => (
              doorwayMapping.id === NEW_ROW ? (
                <InputBox
                  type="select"
                  placeholder={`Select ${service.display_name} ${serviceDoorwayResourceName}`}
                  choices={serviceDoorwayChoices}
                  value={newServiceDoorwayId}
                  onChange={e => dispatch(integrationsActions.doorwayMappingChangeServiceDoorwayId(e.id))}
                  width="100%"
                  menuMaxHeight={300}
                />
              ): (
                <InputBox
                  type="select"
                  placeholder={`Select ${service.display_name} ${serviceDoorwayResourceName}`}
                  choices={serviceDoorwayChoices}
                  value={doorwayMapping.service_doorway_id}
                  onChange={e => dispatch(integrationsActions.doorwayMappingUpdateChangeServiceDoorwayId(doorwayMapping.id, e.id))}
                  width="100%"
                  menuMaxHeight={300}
                />
              )
            )}
          />
          <ListViewColumn
            id="Actions"
            title=" "
            width={100}
            template={(doorwayMapping: DensityDoorwayMappingWithStatus) => (
              doorwayMapping.id === NEW_ROW ? (
                <Button
                  variant="filled"
                  disabled={newDoorwayId === null || newServiceDoorwayId === null}
                  onClick={() => doorwayMappingsAdd(
                    dispatch,
                    service.id,
                    newDoorwayId as string,
                    newServiceDoorwayId as string
                  )}
                >
                  Create
                </Button>
              ) : (
                doorwayMapping.status === 'DIRTY' ? (
                  <Button
                    variant="filled"
                    onClick={() => doorwayMappingsUpdate(
                      dispatch,
                      doorwayMapping.id,
                      doorwayMapping.doorway_id,
                      doorwayMapping.service_doorway_id,
                    )}
                  >
                    Update
                  </Button>
                ) : (
                  <Button
                    variant="underline"
                    onClick={() => doorwayMappingsDelete(dispatch, doorwayMapping.id)}
                  >
                    Delete
                  </Button>
                )
              )
            )}
          />
        </ListView>
      </Fragment>
    );
  }
}

const AdminIntegrationsDetails: React.FunctionComponent<{
  visible: boolean,
  onCloseModal: () => void,
  selectedService: SelectedService,
  services: Array<DensityService>,
}> = ({ visible, onCloseModal, selectedService, services }) => {
  const [ serviceDeleteBoxText, setServiceDeleteBoxText ] = useState('');

  // Clear the delete box text when the visiblity of the modal changes.
  useEffect(() => {
    setServiceDeleteBoxText('');
  }, [ visible ]);

  const dispatch = useRxDispatch();

  if (!selectedService.id) {
    return null;
  }

  const service = services.find(s => s.id === selectedService.id);
  if (!service) {
    return null;
  }

  const serviceStatus = getServiceStatus(service);

  const {
    activationProcess,
    doorwayMappings,
    spaceMappings,
  } = getServiceRenderingPreferences(service);

  return (
    <Modal
      visible={visible}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
      width={1200}
      height={895}
    >
      <div className={styles.modalWrapper}>
        <AppBar>
          <AppBarTitle>
            <img
              className={styles.modalIcon}
              alt=""
              src={iconForIntegration(service.name)}
            />
            {service.display_name}
          </AppBarTitle>
          <AppBarSection>
            <Button variant="underline" onClick={onCloseModal}>Close</Button>
          </AppBarSection>
        </AppBar>
        <div className={styles.modalBody}>

          <div className={styles.modalBodyLeft}>
            <div className={styles.modalBodyLeftHeaderRow}>
              <IntegrationTypeTag>
                {service.category === 'Tailgating' ? 'Access Control' : service.category}
              </IntegrationTypeTag>
              <Status status={serviceStatus} includeLabel />
            </div>

            <p>lorem ipsum dolar set amet HARDCODED!</p>

            {typeof service.service_authorization.id !== 'undefined' ? (() => {
              const serviceAuthorizationUser: CoreUser = (service.service_authorization as Any<FixInRefactor>).user;
              return (
                <ul>
                  <li>
                    Added by: <strong>{serviceAuthorizationUser.full_name}</strong> ({serviceAuthorizationUser.email})
                  </li>
                  <li>
                    Default {service.category} service: <strong>{service.service_authorization.default ? 'Yes' : 'No'}</strong>
                    {!service.service_authorization.default ? (
                      <Button onClick={() => serviceAuthorizationMakeDefault(dispatch, service.service_authorization)}>
                        Make Default
                      </Button>
                    ) : null}
                  </li>
                </ul>
              );
            })() : null}
          </div>

          <div className={styles.modalBodyRight}>
            {serviceStatus === 'inactive' ? (
              <Fragment>
                {activationProcess.type === 'login' ? (
                  <EmptyCard
                    actions={
                      <Button onClick={() => activationProcess.onClick(service)}>
                        Log in to {service.display_name}
                      </Button>
                    }
                  >
                    You need to log in to your <strong>{service.display_name}</strong> account before
                    you can start configuring this integration.
                  </EmptyCard>
                ) : null}

                {activationProcess.type === 'support' ? (
                  <EmptyCard actions={<Button href="mailto:support@density.io">Contact support</Button>}>
                    Please contact support to configure this integration.
                  </EmptyCard>
                ) : null}

                {activationProcess.type === 'form' ? (() => {
                  const Component = activationProcess.component;
                  return <Fragment>
                    <AppBarContext.Provider value="CARD_HEADER">
                      <AppBar>
                        <AppBarTitle>Set up Integration</AppBarTitle>
                      </AppBar>
                    </AppBarContext.Provider>

                    <Component service={service} />
                  </Fragment>;
                })() : null}
              </Fragment>
            ) : null}
            {serviceStatus === 'active' ? (
              <Fragment>
                <AppBarContext.Provider value="CARD_HEADER">
                  <AppBar>
                    <AppBarTitle>Integration Summary</AppBarTitle>
                  </AppBar>
                </AppBarContext.Provider>
                <p style={{padding: 24}}>
                  Everything is operating as expected.
                </p>

                <SpaceMappings selectedService={selectedService} service={service} />

                <DoorwayMappings selectedService={selectedService} service={service} />

                <AppBarContext.Provider value="CARD_HEADER">
                  <AppBar>
                    <AppBarTitle>Danger Zone</AppBarTitle>
                  </AppBar>
                </AppBarContext.Provider>
                <div style={{padding: 24}}>
                  Remove this integration - once removed, it must be
                  re-setup again to re-enable.
              
                  Enter "{service.display_name}" into the box below, and click delete to remove:
                  <InputBox type="text" value={serviceDeleteBoxText} onChange={e => setServiceDeleteBoxText(e.target.value)} />

                  <Button
                    disabled={serviceDeleteBoxText !== service.display_name}
                    type="danger"
                    onClick={() => serviceAuthorizationDelete(dispatch, service.service_authorization)}
                  >Delete</Button>
                  
                  {activationProcess.type === 'login' ? (
                    <Button onClick={() => activationProcess.onClick(service)}>
                      Re-authorize {service.display_name}
                    </Button>
                  ) : null}

                  {activationProcess.type === 'support' ? (
                    <p>To re-authorize this service, plaese contact support.</p>
                  ) : null}

                  {activationProcess.type === 'form' ? (() => {
                    const Component = activationProcess.component;
                    return <Fragment>
                      <AppBarContext.Provider value="CARD_HEADER">
                        <AppBar>
                          <AppBarTitle>Re-Authorize Integration</AppBarTitle>
                        </AppBar>
                      </AppBarContext.Provider>

                      <Component service={service} />
                    </Fragment>;
                  })() : null}
                </div>
              </Fragment>
            ): null}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AdminIntegrations: React.FunctionComponent<{}> = () => {
  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const integrations = useRxStore(IntegrationsStore);

  const [ search, setSearch ] = useState('');

  const header = (
    <AppBar>
      <AppBarSection>
        {integrations.services.status === ResourceStatus.COMPLETE ? (
          <InputBox
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            width={300}
            placeholder="Search for integration ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        ) : (
          <Skeleton width={300} height={24} />
        )}
      </AppBarSection>
      <AppBarSection>
         Looking for a different integration? Contact us at&nbsp;
         <a className={styles.contactLink} href="mailto:contact@density.io" target="_blank" rel="noopener noreferrer">
          contact@density.io
        </a>.
      </AppBarSection>
    </AppBar>
  );

  switch (integrations.services.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return (
      <Fragment>
        {header}
        <p>Loading</p>
      </Fragment>
    );
  case ResourceStatus.ERROR:
    return (
      <Fragment>
        {header}
        <p>Error: {integrations.services.error}</p>;
      </Fragment>
    );
  case ResourceStatus.COMPLETE:
    const filteredServices = filterServices(integrations.services.data, search);

    const integrationsByCategory: {[category: string]: Array<DensityService>} = integrations.services.data.reduce((acc, service) => {
      const data = acc[service.category] || [];

      if (
        search.length === 0 || // No search query entered
        filteredServices.includes(service) // Search query matches
      ) {
        data.push(service);
      }

      return {
        ...acc,
        [service.category]: data,
      };
    }, {});

    return (
      <Fragment>
        {activeModal.name === 'integration-details' ? (
          <AdminIntegrationsDetails
            visible={activeModal.visible}
            onCloseModal={() => closeService(dispatch)}
            selectedService={integrations.selectedService as SelectedService}
            services={integrations.services.data}
          />
        ) : null}

        {header}

        <AppScrollView backgroundColor={colorVariables.gray000}>
          {Object.entries(integrationsByCategory).map(([category, services]) => (
            <div className={styles.listSection} key={category}>
              <h2 className={styles.listSectionHeader}>
                {category === 'Tailgating' ? 'Access Control' : category}
              </h2>
              {services.length > 0 ? (
                <div className={styles.cardList}>
                  {services.sort((a, b) => a.display_name.localeCompare(b.display_name)).map(service => {
                    return (
                      <div
                        className={styles.card}
                        key={service.name}
                        tabIndex={0}
                        aria-label={service.display_name}
                        role="button"
                        onClick={() => openService(dispatch, service, getServiceRenderingPreferences(service))}
                      >
                        <div className={styles.row}>
                          <img
                            className={styles.icon}
                            alt=""
                            src={iconForIntegration(service.name)}
                          />
                          <Status hideInactiveIcon status={getServiceStatus(service)} />
                        </div>
                        <h3 className={styles.header}>{service.display_name}</h3>
                        <p>lorem ipsum dolar set amet HARDCODED!</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.cardListEmpty}>
                  No Services Found
                </div>
              )}
            </div>
          ))}
        </AppScrollView>
      </Fragment>
    );
  }
}
export default AdminIntegrations;
