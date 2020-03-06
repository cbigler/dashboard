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
} from '@density/ui/src';
import FormLabel from '../form-label';

import Status, { ServiceStatus } from './status';
import EmptyCard from './empty-card';

import robinIcon from '../../assets/images/icon-robin.svg';
import googleCalendarIcon from '../../assets/images/icon-google-calendar.svg';
import slackIcon from '../../assets/images/icon-slack.svg';
import teemIcon from '../../assets/images/icon-teem.svg';
import outlookIcon from '../../assets/images/icon-outlook.svg';
import condecoIcon from '../../assets/images/icon-condeco.svg';
import brivoIcon from '../../assets/images/icon-brivo.svg';
import colorVariables from '@density/ui/variables/colors.json';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import updateModal from '../../rx-actions/modal/update';
import { showToast } from '../../rx-actions/toasts';
import collectionServiceAuthorizationCreate from '../../rx-actions/collection/service-authorizations/create';
import { collectionServiceAuthorizationMakeDefault } from '../../rx-actions/collection/service-authorizations/update';
import collectionServiceAuthorizationDestroy from '../../rx-actions/collection/service-authorizations/destroy';
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

type ServicePreferences = {
  activationProcess: (
    // "Login": The user needs to log into the service in the browser to activate the integration.
    | { type: 'login', onClick: (service: DensityService) => void }
    // "Support": The user needs to contact support to set up the integration
    | { type: 'support' }
    // "Form": The user needs to fill out a custom form to activate the integration
    | { type: 'form', component: React.FunctionComponent<{service: DensityService}> }
  ),
  hasSpaceMappings: boolean,
  hasDoorwayMappings: boolean,
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
              <Button variant="underline" onClick={() => hideModal(dispatch)}>Cancel</Button>
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
                      hideModal(dispatch);
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

const SERVICE_PREFERENCES: {[serviceName: string]: ServicePreferences} = {
  // Room Booking
  'condeco': {
    activationProcess: {type: 'support'},
    hasSpaceMappings: false,
    hasDoorwayMappings: false,
  },
  'google_calendar': {
    activationProcess: {
      type: 'login',
      onClick: () => doGoogleCalendarAuthRedirect(),
    },
    hasSpaceMappings: true,
    hasDoorwayMappings: false,
  },
  'outlook': {
    activationProcess: {
      type: 'login',
      onClick: () => doOutlookAuthRedirect(),
    },
    hasSpaceMappings: true,
    hasDoorwayMappings: false,
  },
  'robin': {
    activationProcess: { type: 'form', component: RobinActivationForm },
    hasSpaceMappings: true,
    hasDoorwayMappings: false,
  },
  'teem': {
    activationProcess: {
      type: 'login',
      onClick: () => {
        window.location.href = `https://app.teem.com/oauth/authorize/?client_id=${process.env.REACT_APP_TEEM_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_TEEM_REDIRECT_URL}&response_type=code&scope=reservations`;
      },
    },
    hasSpaceMappings: true,
    hasDoorwayMappings: false,
  },

  // Chat
  'slack': {
    activationProcess: {
      type: 'login',
      onClick: () => {
        window.location.href = `https://slack.com/oauth/authorize?client_id=${process.env.REACT_APP_SLACK_CLIENT_ID}&scope=bot,chat:write:bot&redirect_uri=${process.env.REACT_APP_SLACK_REDIRECT_URL}`;
      },
    },
    hasSpaceMappings: false,
    hasDoorwayMappings: false,
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
    hasSpaceMappings: false,
    hasDoorwayMappings: true,
  },
};

const IntegrationTypeTag: React.FunctionComponent<{}> = ({children}) => (
  <div className={styles.integrationTypeTag}>
    {children}
  </div>
);

const AdminIntegrationsDetails: React.FunctionComponent<{
  visible: boolean,
  onCloseModal: () => void,
  service: DensityService,
  serviceStatus: ServiceStatus,
}> = ({ visible, onCloseModal, service, serviceStatus }) => {
  const [ serviceDeleteBoxText, setServiceDeleteBoxText ] = useState('');

  // Clear the delete box text when the visiblity of the modal changes.
  useEffect(() => {
    setServiceDeleteBoxText('');
  }, [ visible ]);

  const {
    activationProcess,
    hasDoorwayMappings,
    hasSpaceMappings,
  } = SERVICE_PREFERENCES[service.name];

  const dispatch = useRxDispatch();

  return (
    <Modal
      visible={visible}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
      width={895}
      height={637}
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
                      <Button onClick={() => {
                        collectionServiceAuthorizationMakeDefault(dispatch, service.service_authorization.id).then(response => {
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
                  return <Component service={service} />;
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

                {hasDoorwayMappings ? (
                  <Button target="_blank" href={`#/admin/integrations/${service.name}/doorway-mappings`}>
                    Configure Doorway Mappings
                  </Button>
                ) : null}

                {hasSpaceMappings ? (
                  <Button target="_blank" href={`#/admin/integrations/${service.name}/space-mappings`}>
                    Configure Space Mappings
                  </Button>
                ) : null}

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
                    onClick={() => {
                      hideModal(dispatch);
                      collectionServiceAuthorizationDestroy(dispatch, service.service_authorization.id).then(ok => {
                        if (ok) {
                          showToast(dispatch, {
                            text: `Removed ${service.display_name} integration.`,
                          });
                        } else {
                          showToast(dispatch, {
                            type: 'error',
                            text: `Failed to remove ${service.display_name} integration.`,
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

  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }

  const onCloseModal = async () => {
    await hideModal(dispatch);
  }

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
            onCloseModal={onCloseModal}
            service={activeModal.data.service}
            serviceStatus={activeModal.data.serviceStatus}
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
                    let status: ServiceStatus = 'inactive';
                    if (service.service_authorization.id) {
                      status = 'active';
                    }
                    // TODO: somehow set error status sometimes too

                    return (
                      <div
                        className={styles.card}
                        key={service.name}
                        tabIndex={0}
                        aria-label={service.display_name}
                        role="button"
                        onClick={() => onOpenModal('integration-details', { service, serviceStatus: status })}
                      >
                        <div className={styles.row}>
                          <img
                            className={styles.icon}
                            alt=""
                            src={iconForIntegration(service.name)}
                          />
                          <Status hideInactiveIcon status={status} />
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
