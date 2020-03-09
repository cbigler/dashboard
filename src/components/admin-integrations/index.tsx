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
import collectionServiceAuthorizationCreate from '../../rx-actions/collection/service-authorizations/create';
import { collectionServiceAuthorizationMakeDefault } from '../../rx-actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../rx-actions/collection/service-authorizations/destroy';
import doGoogleCalendarAuthRedirect from '../../rx-actions/integrations/google-calendar';
import doOutlookAuthRedirect from '../../rx-actions/integrations/outlook';

import { DensityService, DensitySpaceMapping, DensityDoorwayMapping } from '../../types';
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
} from '../../types/integrations';
import {
  integrationsActions,

  openService,
  closeService,
  spaceMappingsAdd,
} from '../../rx-actions/integrations';

import core from '../../client/core';

const filterServices = filterCollection({fields: ['display_name']});

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

const RobinActivationForm: React.FunctionComponent<{service: DensityService}> =  () => {
  const [ accessToken, setAccessToken ] = useState('');
  const [ organizationId, setOrganizationId ] = useState('');

  const dispatch = useRxDispatch();

  return (
    <Fragment>
      <AppBarContext.Provider value="CARD_HEADER">
        <AppBar>
          <AppBarTitle>Set up Integration</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
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
              <Button variant="underline" onClick={() => closeService(dispatch)}>Cancel</Button>
              <Button
                variant="filled"
                onClick={() => {
                  collectionServiceAuthorizationCreate(dispatch, 'robin', {
                    credentials: {
                      robin_access_token: accessToken,
                      robin_organization_id: organizationId,
                    },
                  }).then(ok => {
                    if (ok) {
                      closeService(dispatch);
                      showToast(dispatch, {
                        text: 'Created robin integration!',
                      });
                    }
                  });
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
      serviceSpaceResourceName: 'calendar',
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
      serviceSpaceResourceName: 'calendar',
    },
    doorwayMappings: {enabled: false},
  },
  'robin': {
    activationProcess: { type: 'form', component: RobinActivationForm },
    spaceMappings: {
      enabled: true,
      serviceSpaceResourceName: 'space',
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
      serviceSpaceResourceName: 'space',
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
      fetchServiceDoorways: service => Promise.resolve([]),
      serviceDoorwayResourceName: 'access point',
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

const SpaceMappings: React.FunctionComponent<{service: SelectedService}> = ({service}) => {
  const dispatch = useRxDispatch();

  const serviceRenderingPreferences = getServiceRenderingPreferences(service.item);
  if (!serviceRenderingPreferences.spaceMappings.enabled) {
    return null;
  }

  const header = (
    <AppBarContext.Provider value="CARD_HEADER">
      <AppBar>
        <AppBarTitle>Space Mappings</AppBarTitle>
      </AppBar>
    </AppBarContext.Provider>
  );

  switch (service.spaceMappings.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return <Fragment>
      {header}
      <p>Loading</p>
    </Fragment>;

  case ResourceStatus.ERROR:
    return <Fragment>
      {header}
      <p>Error</p>
    </Fragment>;

  case ResourceStatus.COMPLETE:
    const spaceHierarchy = spaceHierarchyFormatter(service.spaceMappings.data.hierarchy);
    const serviceSpaceChoices = service.spaceMappings.data.serviceSpaces
        .map(s => ({ id: s.service_space_id, label: s.name }));

    return (
      <Fragment>
        {header}

        <ListView padOuterColumns data={service.spaceMappings.data.spaceMappings}>
          <ListViewColumn
            id="Density Space"
            template={(spaceMapping: DensitySpaceMapping) => (
              <SpacePickerDropdown
                placeholder="Select Density Space"
                value={spaceMapping.space_id}
                onChange={e => console.log(e)}
                formattedHierarchy={spaceHierarchy}
              />
            )}
          />
          <ListViewColumn
            id="Service Space"
            title={`${service.item.display_name} ${serviceRenderingPreferences.spaceMappings.serviceSpaceResourceName}`}
            template={(spaceMapping: DensitySpaceMapping) => (
              <InputBox
                type="select"
                choices={serviceSpaceChoices}
                value={spaceMapping.service_space_id}
                onChange={() => null}
              />
            )}
          />
        </ListView>

        <div style={{display: 'flex'}}>
          <SpacePickerDropdown
            placeholder="Select Density Space"
            value={service.spaceMappings.data.newSpaceId}
            onChange={e => dispatch(integrationsActions.spaceMappingChangeNewSpaceId(e.space.id))}
            formattedHierarchy={spaceHierarchy}
          />
          <InputBox
            type="select"
            placeholder={`Select ${service.item.display_name} ${serviceRenderingPreferences.spaceMappings.serviceSpaceResourceName}`}
            choices={serviceSpaceChoices}
            value={service.spaceMappings.data.newServiceSpaceId}
            onChange={e => dispatch(integrationsActions.spaceMappingChangeServiceSpaceId(e.id))}
          />
          <Button onClick={() => spaceMappingsAdd(dispatch)}>Add</Button>
        </div>
      </Fragment>
    );
  }
}

const DoorwayMappings: React.FunctionComponent<{service: SelectedService}> = ({service}) => {
  const serviceRenderingPreferences = getServiceRenderingPreferences(service.item);
  if (!serviceRenderingPreferences.doorwayMappings.enabled) {
    return null;
  }

  const header = (
    <AppBarContext.Provider value="CARD_HEADER">
      <AppBar>
        <AppBarTitle>Doorway Mappings</AppBarTitle>
        <AppBarSection>
          <Button variant="filled">Add</Button>
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
  );

  switch (service.doorwayMappings.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return <Fragment>
      {header}
      <p>Loading</p>
    </Fragment>;
  case ResourceStatus.ERROR:
    return <Fragment>
      {header}
      <p>Error</p>
    </Fragment>;
  case ResourceStatus.COMPLETE:
    const serviceDoorwayChoices = service.doorwayMappings.data.serviceDoorways
        .map(d => ({id: d.id, label: d.name}));

    return (
      <Fragment>
        {header}

        <ListView padOuterColumns data={service.doorwayMappings.data.doorwayMappings}>
          <ListViewColumn
            id="Density Doorway"
            template={(doorwayMapping: DensityDoorwayMapping) => (
              <InputBox
                type="select"
                choices={[{id: 'foo', label: 'Foo'}]}
                value={doorwayMapping.doorway_id}
                onChange={() => null}
              />
            )}
          />
          <ListViewColumn
            id="Service Doorway"
            title={`${service.item.display_name} ${serviceRenderingPreferences.doorwayMappings.serviceDoorwayResourceName}`}
            template={(doorwayMapping: DensityDoorwayMapping) => (
              <InputBox
                type="select"
                choices={serviceDoorwayChoices}
                value={doorwayMapping.service_doorway_id}
                onChange={() => null}
              />
            )}
          />
        </ListView>

        {/*<Button target="_blank" href={`#/admin/integrations/${service.item.name}/doorway-mappings`}>
          Configure Doorway Mappings
        </Button>*/}
      </Fragment>
    );
  }
}

const AdminIntegrationsDetails: React.FunctionComponent<{
  visible: boolean,
  onCloseModal: () => void,
  service: SelectedService,
}> = ({ visible, onCloseModal, service }) => {
  const [ serviceDeleteBoxText, setServiceDeleteBoxText ] = useState('');

  // Clear the delete box text when the visiblity of the modal changes.
  useEffect(() => {
    setServiceDeleteBoxText('');
  }, [ visible ]);

  const dispatch = useRxDispatch();

  if (!service.item) {
    return null;
  }

  const serviceStatus = getServiceStatus(service.item);

  const {
    activationProcess,
    doorwayMappings,
    spaceMappings,
  } = getServiceRenderingPreferences(service.item);

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
              src={iconForIntegration(service.item.name)}
            />
            {service.item.display_name}
          </AppBarTitle>
          <AppBarSection>
            <Button variant="underline" onClick={onCloseModal}>Close</Button>
          </AppBarSection>
        </AppBar>
        <div className={styles.modalBody}>

          <div className={styles.modalBodyLeft}>
            <div className={styles.modalBodyLeftHeaderRow}>
              <IntegrationTypeTag>
                {service.item.category === 'Tailgating' ? 'Access Control' : service.item.category}
              </IntegrationTypeTag>
              <Status status={serviceStatus} includeLabel />
            </div>

            <p>lorem ipsum dolar set amet HARDCODED!</p>

            {typeof service.item.service_authorization.id !== 'undefined' ? (() => {
              const serviceAuthorizationUser: CoreUser = (service.item.service_authorization as Any<FixInRefactor>).user;
              return (
                <ul>
                  <li>
                    Added by: <strong>{serviceAuthorizationUser.full_name}</strong> ({serviceAuthorizationUser.email})
                  </li>
                  <li>
                    Default {service.item.category} service: <strong>{service.item.service_authorization.default ? 'Yes' : 'No'}</strong>
                    {!service.item.service_authorization.default ? (
                      <Button onClick={() => {
                        collectionServiceAuthorizationMakeDefault(dispatch, service.item.service_authorization.id).then(response => {
                          updateModal(dispatch, { service: {...service, service_authorization: response.data} });
                        });
                      }}>Make Default</Button>
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
                      <Button onClick={() => activationProcess.onClick(service.item)}>
                        Log in to {service.item.display_name}
                      </Button>
                    }
                  >
                    You need to log in to your <strong>{service.item.display_name}</strong> account before
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
                  return <Component service={service.item} />;
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

                <SpaceMappings service={service} />

                <DoorwayMappings service={service} />

                <AppBarContext.Provider value="CARD_HEADER">
                  <AppBar>
                    <AppBarTitle>Danger Zone</AppBarTitle>
                  </AppBar>
                </AppBarContext.Provider>
                <div style={{padding: 24}}>
                  Remove this integration - once removed, it must be
                  re-setup again to re-enable.
              
                  Enter "{service.item.display_name}" into the box below, and click delete to remove:
                  <InputBox type="text" value={serviceDeleteBoxText} onChange={e => setServiceDeleteBoxText(e.target.value)} />

                  <Button
                    disabled={serviceDeleteBoxText !== service.item.display_name}
                    type="danger"
                    onClick={() => {
                      closeService(dispatch);
                      collectionServiceAuthorizationDestroy(dispatch, service.item.service_authorization.id).then(ok => {
                        if (ok) {
                          showToast(dispatch, {
                            text: `Removed ${service.item.display_name} integration.`,
                          });
                        } else {
                          showToast(dispatch, {
                            type: 'error',
                            text: `Failed to remove ${service.item.display_name} integration.`,
                          });
                        }
                      })
                    }}
                  >Delete</Button>
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
            service={integrations.selectedService as SelectedService}
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
