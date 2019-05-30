import React, { Fragment } from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';
import convertUnit, { INCHES, CENTIMETERS } from '../../helpers/convert-unit/index';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
  Icons,
  InputBox,
  Modal,
  RadioButton,
} from '@density/ui';

import ListView, { ListViewColumn } from '../list-view';
import Checkbox from '../checkbox';
import FormLabel from '../form-label/index';

import AdminLocationsDetailModule from './index';
import filterCollection from '../../helpers/filter-collection';
import { fileToDataURI } from '../../helpers/media-files';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';
import spaceManagementCreateDoorway from '../../actions/space-management/create-doorway';
import spaceManagementUpdateDoorway from '../../actions/space-management/update-doorway';

const AC_OUTLET = 'AC_OUTLET',
      POWER_OVER_ETHERNET = 'POWER_OVER_ETHERNET';

function processModalData(data) {
  return {
    ...data,
    width: parseFloat(data.width),
    height: parseFloat(data.height),
  };
}

function AdminLocationsDetailModulesDoorwayModal({
  visible,
  modalState,
  onUpdateModalState,
  onCloseModal,
  onSubmitModal,
}) {
  function onChangeField(key, value) {
    onUpdateModalState({
      ...modalState,
      data: { ...modalState.data, [key]: value },
    });
  }

  const shortMeasurementUnit = (
    <span className={styles.doorwayFormMeasurementUnit}>
      {
        ({
          [CENTIMETERS]: '(cm)',
          [INCHES]: '(in)',
        })[modalState.data.measurementUnit] || ''
      }
    </span>
  );

  const formValid = (
    modalState.data.name && modalState.data.name.length > 0 &&
    modalState.data.sensorPlacement &&
    // Require a measurement unit if the user has an entered width / height
    ((modalState.data.width || modalState.data.height) ? modalState.data.measurementUnit : true)
  );

  return (
    <Modal
      visible={visible}
      width={486}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <AppBar>
        <AppBarTitle>
          {modalState.type === 'CREATE' ? 'New Doorway' : 'Edit Doorway'}
        </AppBarTitle>
      </AppBar>

      <div className={styles.doorwayModalFirstSection}>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-doorways-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-doorways-name"
              value={modalState.data.name || ''}
              placeholder={'ex: "Main Entry", "Stairwell A"'}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
      </div>

      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar>
          <AppBarTitle>DPU Position</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.doorwayModalSection}>
        TODO
      </div>

      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar>
          <AppBarTitle>Installation Details</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>

      <div className={styles.doorwayModalSection}>
        <div className={styles.doorwayModalSectionHorizontalForm}>
          <FormLabel
            label="Units"
            htmlFor="admin-locations-detail-modules-doorways-units"
            input={
              <InputBox
                type="select"
                id="admin-locations-detail-modules-doorways-units"
                value={modalState.data.measurementUnit}
                placeholder="Pick Units"
                choices={[
                  {id: CENTIMETERS, label: 'Metric'},
                  {id: INCHES, label: 'Imperial'},
                ]}
                onChange={item => onChangeField('measurementUnit', item.id)}
                width={130}
              />
            }
          />
          <FormLabel
            label={<span>Height {shortMeasurementUnit}</span>}
            htmlFor="admin-locations-detail-modules-doorways-height"
            input={
              <InputBox
                type="number"
                id="admin-locations-detail-modules-doorways-height"
                value={modalState.data.height || ''}
                placeholder={'ex: "84"'}
                onChange={e => onChangeField('height', e.target.value)}
                width={130}
              />
            }
          />
          <FormLabel
            label={<span>Width {shortMeasurementUnit}</span>}
            htmlFor="admin-locations-detail-modules-doorways-width"
            input={
              <InputBox
                type="number"
                id="admin-locations-detail-modules-doorways-width"
                value={modalState.data.width || ''}
                placeholder={'ex: "84"'}
                onChange={e => onChangeField('width', e.target.value)}
                width={130}
              />
            }
          />
        </div>
        <div className={styles.doorwayModalSectionMountingSpace}>
          <p>Is there enough mounting space above this doorway?</p>
          <div className={styles.doorwayModalSectionHorizontalForm}>
            <div className={styles.doorwayFormMountingSpaceRadioButtonGroup}>
              <RadioButton
                text="Yes"
                checked={modalState.data.clearance === true}
                onChange={e => onChangeField('clearance', e.target.checked)}
              />
              <RadioButton
                text="No"
                checked={modalState.data.clearance === false}
                onChange={e => onChangeField('clearance', !e.target.checked)}
              />
            </div>
						{MOUNTING_SPACE_GLYPH}
          </div>
        </div>
        <FormLabel
          label="Power Option"
          htmlFor="admin-locations-detail-modules-doorways-power"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-doorways-power"
              value={modalState.data.powerType}
              choices={[
                {id: POWER_OVER_ETHERNET, label: 'Power over Ethernet (803.2at PoE+)'},
                {id: AC_OUTLET, label: 'AC Outlet'},
              ]}
              onChange={item => onChangeField('powerType', item.id)}
              width="100%"
            />
          }
        />
      </div>

      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar>
          <AppBarTitle>Photos</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.doorwayModalSection}>
        <AdminLocationsImageUpload
          label="Photo from inside the space"
          value={modalState.data.newInsideImageData || modalState.data.insideImageUrl}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onChangeField('newInsideImageData', result);
            } else {
              onChangeField('newInsideImageData', null);
            }
          }}
        />
        <AdminLocationsImageUpload
          label="Photo from outside the space"
          value={modalState.data.newOutsideImageData || modalState.data.outsideImageUrl}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onChangeField('newOutsideImageData', result);
            } else {
              onChangeField('newOutsideImageData', null);
            }
          }}
        />
      </div>

      {modalState.type !== 'CREATE' ? (
        <div className={styles.doorwayModalDangerZoneWrapper}>
          <div className={styles.doorwayModalDangerZoneText}>
            <h4>Delete this doorway</h4>
            <p>Once deleted, it will be gone forever. Please be certain.</p>
          </div>
          <div>
            <ButtonContext.Provider value="DELETE_BUTTON">
              <Button>Delete this Doorway</Button>
            </ButtonContext.Provider>
          </div>
        </div>
      ) : null}

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonContext.Provider value="CANCEL_BUTTON">
              <Button onClick={onCloseModal}>Cancel</Button>
            </ButtonContext.Provider>
            <Button
              type="primary"
              disabled={!formValid}
              onClick={() => onSubmitModal(modalState)}
            >Save Doorway</Button>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

function DoorwayList({
  doorways,
  shaded=false,
  onSelectDoorway,
  onChangeDoorwaySensorPlacement,
  onEditDoorway,
}) {
  return (
    <div className={classnames(styles.doorwayList, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          title="Doorways"
          template={item => {
            const newDoorwayCheckboxState = !item.selected;
            return (
              <Fragment>
                <Checkbox
                  checked={item.selected}
                  onChange={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                />
                <div
                  className={styles.doorwayItemContainer}
                  onClick={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                >
                  <Icons.Doorway color={colorVariables.grayDarkest} />
                  <span className={styles.doorwayName}>{item.name}</span>
                </div>
              </Fragment>
            );
          }}
          flexGrow={1}
          flexShrink={1}
          width={320}
        />
        <ListViewColumn
          title="Linked Spaces"
          template={i => {
            if (i.spaces.length > 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{i.spaces.length} Linked Spaces</span>
                </div>
              );
            } else if (i.spaces.length === 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{i.spaces[0].name}</span>
                </div>
              );
            } else {
              return (
                <Fragment>Not linked</Fragment>
              )
            }
          }}
          width={240}
        />
        <ListViewColumn
          title="DPU Position"
          template={i => {
            return (
              <Fragment>
                {i.sensorPlacement !== null ? (
                  <Fragment>
                    <Button
                      size="small"
                      width={40}
                      height={40}
                      onClick={() => onChangeDoorwaySensorPlacement(
                        i,
                        i.sensorPlacement === 1 ? -1 : 1,
                      )}
                    >
                      <Icons.Switch color={colorVariables.brandPrimary} />
                    </Button>
                    <span className={styles.doorwaysDpuPosition}>
                      {i.sensorPlacement === 1 ? 'Inside' : 'Outside'}
                    </span>
                  </Fragment>
                ) : (
                  <Fragment>&mdash;</Fragment>
                )}
              </Fragment>
            );
          }}
          width={160}
        />
        <ListViewColumn
          title={null}
          template={i => i.selected ? (
            <div
              className={styles.doorwaysEditLink}
              onClick={onEditDoorway}
            >
              Edit
            </div>
          ): null}
          width={50}
        />
      </ListView>
    </div>
  );
}

export default function AdminLocationsDetailModulesDoorways({
  formState,
  onChangeDoorwaysFilter,
  onChangeField,
  onSetDoorwayField,
}) {
  const doorwaysFilter = filterCollection({fields: ['name']});
  const filteredDoorways = doorwaysFilter(formState.doorways, formState.doorwaysFilter);

	const topDoorways = filteredDoorways.filter(x => x.list === 'TOP');
	const bottomDoorways = filteredDoorways.filter(x => x.list === 'BOTTOM');

  function onSelectDoorway(doorway, state) {
    onSetDoorwayField(doorway.id, 'selected', state);
    if (state) {
      onSetDoorwayField(doorway.id, 'sensorPlacement', 1);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'UPDATE' : 'CREATE',
      );
    } else {
      onSetDoorwayField(doorway.id, 'sensorPlacement', null);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'DELETE' : null,
      );
    }
  }
  function onChangeDoorwaySensorPlacement(doorway, sensorPlacement) {
    onSetDoorwayField(doorway.id, 'sensorPlacement', sensorPlacement);
    onSetDoorwayField(
      doorway.id,
      'operationToPerform',
      doorway.operationToPerform === 'CREATE' ? 'CREATE' : 'UPDATE',
    );
  }
  function onEditDoorway(doorwayId) {
    console.log('EDIT', doorwayId);
  }

  return (
    <AdminLocationsDetailModule title="Doorways" includePadding={false}>
      <AppBar>
        <AppBarSection>
          <InputBox
            leftIcon={<Icons.Search />}
            placeholder={'ex: "Doorway A", "Stairwell B"'}
            width={344}
            onChange={e => onChangeDoorwaysFilter(e.target.value)}
          />
        </AppBarSection>
        <AppBarSection>
          <Button onClick={() => {
            console.log('CREATE');
          }}>
            Add a doorway
          </Button>
        </AppBarSection>
      </AppBar>
      <div className={styles.doorwayLists}>
        {topDoorways.length > 0 ? (
          <DoorwayList
            doorways={topDoorways}
            onSelectDoorway={onSelectDoorway}
            onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
            onEditDoorway={onEditDoorway}
          />
        ): (
          <div className={styles.doorwaysEmptyState}>
            <div className={styles.doorwaysEmptyStateInner}>
              {bottomDoorways.find(i => i.selected) ? (
                <div className={styles.doorwaysEmptyStateInnerRight}>
                  <h3>Great, now save this space!</h3>
                  <p>Save a doorway, save a space</p>
                </div>
              ) : (
                <Fragment>
                  <div className={styles.doorwaysEmptyStateInnerLeft}>{DOORWAY_ICON}</div>
                  <div className={styles.doorwaysEmptyStateInnerRight}>
                    <h3>You haven't assigned any doorways to this space yet</h3>
                    <p>Start assigning and start counting</p>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        )}
        <DoorwayList
          doorways={filteredDoorways.filter(x => x.list === 'BOTTOM')}
          onSelectDoorway={onSelectDoorway}
          onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
          onEditDoorway={onEditDoorway}
          shaded
        />
      </div>
    </AdminLocationsDetailModule>
  );
}
