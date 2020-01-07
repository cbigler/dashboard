import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppScrollView,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  ListViewClickableLink,
  Modal,
  Button,
  ButtonGroup,
  RadioButton,
  Icons
} from '@density/ui/src';

import brivoIcon from '../../assets/images/icon-brivo.svg';
import colorVariables from '@density/ui/variables/colors.json';

import core from '../../client/core';
import Toaster from '../toaster/index';
import GenericLoadingIndicator from '../generic-loading-indicator/index';
import classnames from 'classnames';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import BrivoStore from '../../rx-stores/brivo';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import Checkbox from '../checkbox';
import IntegrationsStore from '../../rx-stores/integrations';


function doorwayForBrivoAccessPoint(accessPoint, doorways, doorwayMappings) {
    const mapping = doorwayMappings.find(x => x.serviceDoorwayId === accessPoint.id.toString());
    if (mapping) {
        return doorways.find(x => x.id === mapping.doorwayId) || null;
    }
    return null;
}

function AdminBrivoMappingsAddSite({activeModal, brivo}) {
    const [ids, setIds] = useState([] as Any<FixInRefactor>);
    const unAddedSites = brivo.sites.filter(x => !x.eventSubscriptionId);

    const dispatch = useRxDispatch();

    return <Modal width={480} visible={activeModal.visible}>
        <AppBar><AppBarTitle>Add a site</AppBarTitle></AppBar>
        <div className={classnames(styles.modalBody, styles.modalScoller)}>
            {brivo.sitesLoading ? (
                <div className={styles.loadingIndicatorBanner}>
                    <GenericLoadingIndicator />
                </div>
            ) : null}
            <ListView data={unAddedSites}>
                <ListViewColumn
                    id="Name"
                    width={32}
                    template={site => <Checkbox
                        checked={ids.find(id => id === site.id)}
                        onChange={e => {
                            setIds(e.target.checked ? Array.from(new Set([...ids, site.id])) : ids.filter(id => id !== site.id))
                        }}
                    />}
                />
                <ListViewColumn id="" template={site => site.siteName} />
            </ListView>
        </div>
        <div className={styles.modalFooter}>
            <ButtonGroup>
                <Button variant={'underline'} onClick={() => hideModal(dispatch)}>Cancel</Button>
                <Button variant={'filled'} onClick={() => {
                    ids.forEach(siteId => {
                        core().post(`/integrations/brivo/sites/${siteId}/event_subscription/`);    
                    })
                    dispatch({
                        type: 'BRIVO_ADD_SITES',
                        ids
                    } as Any<FixInRefactor>)
                    hideModal(dispatch);
                }}>Add sites</Button>
            </ButtonGroup>
        </div>
    </Modal>;
}

function AdminBrivoDoorwayMappingsDestroy({activeModal, doorwayMapping}) {
    const dispatch = useRxDispatch();

    return <Modal width={480} visible={activeModal.visible}>
        <AppBar>
            <AppBarSection>
                <AppBarTitle>Unlink</AppBarTitle>
            </AppBarSection>
        </AppBar>
        <div className={styles.modalBody}>
            <p><strong>Are you ABSOLUTELY sure?</strong></p>
            <p>This will disable the access control integration for this doorway.</p>
        </div>
        <div className={styles.modalFooter}>
            <ButtonGroup>
                <Button variant={'underline'} onClick={() => hideModal(dispatch)}>Cancel</Button>
                <Button type={'danger'}
                    onClick={async () => {
                    try {
                        await core().delete(`/integrations/doorway_mappings/${doorwayMapping.id}/`)
                    } catch {
                        // ...
                    }

                    dispatch({
                        type: 'BRIVO_UNASSIGN_DOORWAY',
                        id: doorwayMapping.id,
                    } as Any<FixInRefactor>);
                    hideModal(dispatch);
                }}>I understand the consequences. Unlink.</Button>
            </ButtonGroup>
        </div>
    </Modal>;
}

function AdminBrivoSiteEventSubscriptionDestroy({activeModal, siteId, eventSubscriptionId}) {
    const dispatch = useRxDispatch();

    return <Modal width={480} visible={activeModal.visible}>
        <AppBar>
            <AppBarSection>
                <AppBarTitle>Delete Brivo Site</AppBarTitle>
            </AppBarSection>
        </AppBar>
        <div className={styles.modalBody}>
            <p><strong>Are you ABSOLUTELY sure?</strong></p>
            <p>Removing this Brivo site will remove all of the doorway links beneath it. This will disable the access control integration for these doorways.</p>
        </div>
        <div className={styles.modalFooter}>
            <ButtonGroup>
                <Button variant={'underline'} onClick={() => hideModal(dispatch)}>Cancel</Button>
                <Button type={'danger'}
                    onClick={async () => {
                    try {
                        await core().delete(`/integrations/brivo/sites/${siteId}/event_subscription/${eventSubscriptionId}/`)
                    } catch {
                        // ...
                    }

                    dispatch({
                        type: 'BRIVO_REMOVE_SITE',
                        id: siteId,
                    } as Any<FixInRefactor>);
                    hideModal(dispatch);
                }}>I understand the consequences. Delete.</Button>
            </ButtonGroup>
        </div>
    </Modal>;
}

function AdminBrivoMappingsCreateUpdate({activeModal, brivo, integrations}) {
    const [id, setId] = useState(null as Any<FixInRefactor>);
    const unmappedDoorways = brivo.doorways.filter(x => (
        !brivo.doorwayMappings.find(y => y.doorwayId === x.id)
    ));
    
    const dispatch = useRxDispatch();

    return <Modal width={480} visible={activeModal.visible}>
        <AppBar>
            <AppBarSection>
                <AppBarTitle>Assign doorway</AppBarTitle>
            </AppBarSection>
        </AppBar>
        <div className={classnames(styles.modalBody, styles.modalScroller)}>
            <ListView data={unmappedDoorways}>
                <ListViewColumn
                    id="Doorway"
                    width={32}
                    template={item => <RadioButton
                        checked={id === item.id}
                        onChange={event => setId(item.id)}
                    />}
                />
                <ListViewColumn
                    id=""
                    template={item => item.name}
                />
            </ListView>
        </div>
        <div className={styles.modalFooter}>
            <ButtonGroup>
                <Button onClick={() => hideModal(dispatch)}>Cancel</Button>
                <Button onClick={async () => {
                    // This assumes a service named "brivo" w/ appropriate credentials has been added to the backend
                    const brivo_service = integrations.services.find(x => x.name === 'brivo');
                    
                    try {
                        // This is erroring currently for some reason
                        // Watch out because the accessPoint id is a number in brivo's system
                        // But in ours, the DoorwayMapping "service_doorway_id" is a string
                        const response = await core().post('/integrations/doorway_mappings/', {
                            service_id: brivo_service.id,
                            doorway_id: id,
                            service_doorway_id: activeModal.data.accessPoint.id,
                        })
                        dispatch({
                            type: 'BRIVO_ASSIGN_DOORWAY',
                            id: response.data['id'],
                            doorwayId: response.data['doorway_id'],
                            serviceDoorwayId: activeModal.data.accessPoint.id.toString(),
                            serviceId: response.data['service_id'],
                        } as Any<FixInRefactor>);
                    } catch {
                        // ...
                    }

                    hideModal(dispatch);
                }}>Link Doorway</Button>
            </ButtonGroup>
        </div>
    </Modal>;
}


export default function AdminBrivoMappings () {
    const dispatch = useRxDispatch();
    const activeModal = useRxStore(ActiveModalStore);
    const integrations = useRxStore(IntegrationsStore);
    const brivo = useRxStore(BrivoStore);

    const addedSites = brivo.sites.filter(x => !!x.eventSubscriptionId);
  
    return <Fragment>

    {activeModal.name === 'brivo-site-add' ? <AdminBrivoMappingsAddSite activeModal={activeModal} brivo={brivo} /> : null}
    {activeModal.name === 'brivo-mappings-create-update' ? <AdminBrivoMappingsCreateUpdate activeModal={activeModal} brivo={brivo} integrations={integrations} /> : null}
    {activeModal.name === 'brivo-doorway-mappings-destroy' ? <AdminBrivoDoorwayMappingsDestroy activeModal={activeModal} doorwayMapping={activeModal.data.doorwayMapping}/> : null}
    {activeModal.name === 'brivo-site-destroy' ? <AdminBrivoSiteEventSubscriptionDestroy activeModal={activeModal} eventSubscriptionId={activeModal.data.site.eventSubscriptionId} siteId={activeModal.data.site.id}/> : null}


    <Toaster />

    <AppBar>
        <AppBarSection>
            <a className={styles.appBarNavigationIcon} role="button" href="#/admin/integrations">
                <Icons.ArrowLeft />
            </a>
            <img alt="Brivo Logo" src={brivoIcon} className={styles.integrationSettingsAppBarIcon} />
            <AppBarTitle>Brivo Doorway Mappings</AppBarTitle>
        </AppBarSection>
        <AppBarSection>
            <Button onClick={e => showModal(dispatch, 'brivo-site-add', {})}>Add a site</Button>
        </AppBarSection>
    </AppBar>

    <AppScrollView backgroundColor={colorVariables.grayLightest}>
        <div className={styles.appContent}>
        {brivo.sitesLoading ? (
            <div className={styles.loadingIndicatorBanner}>
                <GenericLoadingIndicator />
                <div className={styles.loadingIndicatorMessage}>{brivo.numberOfSitesLoaded} site(s) loaded</div>
            </div>
            ) :
            
            (addedSites.length > 0 ? addedSites.map(site =>
                <Fragment key={site.id}>
                <div className={styles.brivoSiteSection}>
                    <div className={styles.brivoSiteSectionHeader}>
                        <div className={styles.brivoSiteSectionHeaderIcon}>
                            <Icons.Building color={colorVariables.grayDarker} />
                        </div>
                        <h3 className={styles.brivoSiteSectionHeaderName}>{site.siteName}</h3>
                        <Button height={40} width={40}
                            onClick={() => showModal(dispatch, 'brivo-site-destroy', {site})}>
                            <Icons.Trash color={colorVariables.grayDarker}/>
                        </Button>
                    </div>
    
                    <div className={styles.brivoSiteSectionBody}>
                        {site.accessPoints.length > 0 ? (
                            <ListView keyTemplate={accessPoint => accessPoint.id} data={site.accessPoints}>
                                <ListViewColumn
                                    id="Access point"
                                    width={360}
                                    template={accessPoint => accessPoint.name}
                                />
                                <ListViewColumn
                                    id="Density Doorway"
                                    width={200}
                                    template={accessPoint => {
                                        const doorway = doorwayForBrivoAccessPoint(accessPoint, brivo.doorways, brivo.doorwayMappings);
                                        if (doorway) {
                                            return doorway.name
                                        } else {
                                            return <ListViewClickableLink>Link to a doorway...</ListViewClickableLink>
                                        }
                                    }}
                                    onClick={accessPoint => showModal(dispatch, 'brivo-mappings-create-update', {
                                        site,
                                        accessPoint
                                    })}
                                />
                                <ListViewColumnSpacer />
                                <ListViewColumn
                                    id=""
                                    width={40}
                                    template={accessPoint => {
                                        const doorwayMapping = brivo.doorwayMappings.find(x => x.serviceDoorwayId === accessPoint.id.toString());
                                        return doorwayMapping ? <ListViewClickableLink onClick={() => showModal(dispatch, 'brivo-doorway-mappings-destroy', {doorwayMapping})}>
                                                    <Icons.LinkBroken color={colorVariables.grayDarker} />
                                                </ListViewClickableLink> : null;
                                    }}
                                />
                            </ListView>
                        ) : (
                            <div className={styles.listViewEmptyMessage}>There are no access points at this site</div>
                        )}
                        
                    </div>
                </div>
                </Fragment>
                
                ) :
                <div className={styles.appContentEmptyBanner}>
                    <h3 className={styles.appContentEmptyBannerTitle}>You haven't added any Brivo sites</h3>
                    <p className={styles.appContentEmptyBannerText}>Add Brivo sites to start linking access points to Density enabled doorways.</p>
                    <Button onClick={e => showModal(dispatch, 'brivo-site-add', {})}>Add a site</Button>
                </div>
            )
        }
        </div>
    </AppScrollView>
    </Fragment>;
}
