import React, { Fragment } from 'react';
import classnames from 'classnames';

import styles from './doorways.module.scss';
import colorVariables from '@density/ui/variables/colors.json';
import { convertUnit, INCHES, CENTIMETERS } from '@density/lib-common-helpers';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  ListView,
  ListViewColumn,
  Modal,
  RadioButton,
} from '@density/ui/src';

import Checkbox from '../checkbox';
import FormLabel from '../form-label/index';

import AdminLocationsDetailModule from './index';
import filterCollection from '../../helpers/filter-collection';
import { fileToDataURI } from '../../helpers/media-files';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import updateModal from '../../rx-actions/modal/update';
import spaceManagementCreateDoorway from '../../rx-actions/space-management/create-doorway';
import spaceManagementUpdateDoorway from '../../rx-actions/space-management/update-doorway';
import spaceManagementDeleteDoorway from '../../rx-actions/space-management/delete-doorway';

import {
  DOORWAY_ICON,
  MOUNTING_SPACE_GLYPH,
  INSIDE_THE_SPACE_GLYPH,
  OUTSIDE_THE_SPACE_GLYPH
} from './doorway_glyphs';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import SpaceManagementStore from '../../rx-stores/space-management';

const AC_OUTLET = 'AC_OUTLET',
      POWER_OVER_ETHERNET = 'POWER_OVER_ETHERNET';

function processModalData(data) {
  const width = parseFloat(data.width);
  const height = parseFloat(data.height);
  return {
    ...data,
    width: isNaN(width) ? null : width,
    height: isNaN(height) ? null : height,
  };
}

type SensorPositionProps = {
  space_name: string,
  value: 1 | -1,
  onChange: (value: 1 | -1) => void,
};

function SensorPosition({ space_name, value, onChange }: SensorPositionProps) {
  return (
    <div className={styles.sensorPositionWrapper}>
      <p>
        Is the Sensor inside or outside of{' '}
        <strong>{space_name && space_name.length > 0 ? space_name : 'this space'}</strong>?
      </p>
      <div className={styles.sensorPositionButtonWrapper}>
        <div
          className={classnames(styles.sensorPositionButton, {[styles.active]: value === 1})}
          onClick={() => onChange(1)}
        >
          {INSIDE_THE_SPACE_GLYPH}
          <RadioButton
            checked={value === 1}
            onChange={() => onChange(1)}
            text="Inside the space"
          />
        </div>
        <div
          className={classnames(styles.sensorPositionButton, {[styles.active]: value === -1})}
          onClick={() => onChange(-1)}
        >
          {OUTSIDE_THE_SPACE_GLYPH}
          <RadioButton
            checked={value === -1}
            onChange={() => onChange(-1)}
            text="Outside the space"
          />
        </div>
      </div>
    </div>
  );
}

type UpdateHistoricCountsProps = {
  value: boolean,
  onChange: (value: boolean) => void,
}
function UpdateHistoricCounts({value, onChange}: UpdateHistoricCountsProps) {
  return null && (
    <div className={styles.sensorPositionUpdateHistoricCheckbox}>
      <Checkbox
        label="Update historic space counts"
        checked={value}
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          onChange(target.checked)
        }}
      />
    </div>
  );
}

function AdminLocationsDetailModulesDoorwaySensorPositionModal({
  visible,
  space_name,
  sensor_placement,
  updateHistoricCounts,
  onUpdateSensorPlacement,
  onUpdateHistoricCounts,
  onCloseModal,
  onSubmitModal,
}) {
  return (
    <Modal
      visible={visible}
      width={486}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <AppBar>
        <AppBarTitle>Sensor position</AppBarTitle>
      </AppBar>

      <div className={styles.modalSection}>
        <SensorPosition
          space_name={space_name}
          value={sensor_placement}
          onChange={onUpdateSensorPlacement}
        />
        <UpdateHistoricCounts value={updateHistoricCounts} onChange={onUpdateHistoricCounts} />
      </div>

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
              <Button
                type="primary"
                variant="filled"
                onClick={() => onSubmitModal(sensor_placement, updateHistoricCounts)}
              >Save Link</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

function AdminLocationsDetailModulesDoorwayModal({
  visible,
  modalState,
  space_name,
  onUpdateModalState,
  onCloseModal,
  onSubmitModal,
  onDeleteDoorway,
}) {
  function onChangeField(key, value) {
    onUpdateModalState({
      ...modalState,
      data: { ...modalState.data, [key]: value },
    });
  }

  const shortMeasurementUnit = (
    <span className={styles.formMeasurementUnit}>
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
    modalState.data.sensor_placement &&
    // Require a measurement unit if the user has an entered width / height
    ((modalState.data.width || modalState.data.height) ? modalState.data.measurementUnit : true)
  );

  const createMode = modalState.type === 'CREATE';

  return (
    <Modal
      visible={visible}
      width={486}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <AppBar>
        <AppBarTitle>
          {createMode ? 'New doorway' : 'Edit doorway'}
        </AppBarTitle>
      </AppBar>

      <div className={styles.modalFirstSection}>
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

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>Sensor position</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.modalSection}>
        <SensorPosition
          value={modalState.data.sensor_placement}
          space_name={space_name}
          onChange={sensor_placement => onChangeField('sensor_placement', sensor_placement)}
        />
        {!createMode ? (
          <UpdateHistoricCounts
            value={modalState.data.updateHistoricCounts}
            onChange={value => onChangeField('updateHistoricCounts', value)}
          />
        ) : null}
      </div>

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>Installation details</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>

      <div className={styles.modalSection}>
        <div className={styles.modalSectionHorizontalForm}>
          <FormLabel
            label="Units"
            htmlFor="admin-locations-detail-modules-doorways-units"
            input={
              <InputBox
                type="select"
                id="admin-locations-detail-modules-doorways-units"
                value={modalState.data.measurementUnit}
                placeholder="Pick units"
                choices={[
                  {id: CENTIMETERS, label: 'Metric'},
                  {id: INCHES, label: 'Imperial'},
                ]}
                onChange={item => {
                  const updatedModalState = {
                    ...modalState,
                    data: {
                      ...modalState.data,
                      measurementUnit: item.id,
                    },
                  };

                  // Convert width / height when management unit is changed
                  if (modalState.data.measurementUnit && item.id !== modalState.data.measurementUnit) {
                    (['width', 'height']).forEach(fieldName => {
                      const parsedValue = parseFloat(modalState.data[fieldName]);
                      if (!isNaN(parsedValue)) {
                        const converted = convertUnit(parsedValue, modalState.data.measurementUnit, item.id);
                        updatedModalState.data[fieldName] = converted;
                      }
                    });
                  }

                  onUpdateModalState(updatedModalState);
                }}
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
        <div className={styles.modalSectionMountingSpace}>
          <p>Is there enough mounting space above this doorway?</p>
          <div className={styles.modalSectionHorizontalForm}>
            <div className={styles.formMountingSpaceRadioButtonGroup}>
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
          label="Power option"
          htmlFor="admin-locations-detail-modules-doorways-power"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-doorways-power"
              value={modalState.data.power_type}
              choices={[
                {id: POWER_OVER_ETHERNET, label: 'Power over Ethernet (803.2at PoE+)'},
                {id: AC_OUTLET, label: 'AC Outlet'},
              ]}
              onChange={item => onChangeField('power_type', item.id)}
              width="100%"
            />
          }
        />
      </div>

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>Photos</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.modalSection}>
        <AdminLocationsImageUpload
          label="Photo from inside the space"
          value={modalState.data.newInsideImageData || modalState.data.inside_image_url}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newInsideImageData: result,
                  newInsideImageFile: file,
                },
              });
            } else {
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newInsideImageData: null,
                  newInsideImageFile: null,
                },
              });
            }
          }}
        />
        <AdminLocationsImageUpload
          label="Photo from outside the space"
          value={modalState.data.newOutsideImageData || modalState.data.outside_image_url}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newOutsideImageData: result,
                  newOutsideImageFile: file,
                },
              });
            } else {
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newOutsideImageData: null,
                  newOutsideImageFile: null,
                },
              });
            }
          }}
        />
      </div>

      {modalState.type !== 'CREATE' ? (
        <div className={styles.modalDangerZoneWrapper}>
          <div className={styles.modalDangerZoneText}>
            <h4>Delete this doorway</h4>
            <p>Once deleted, it will be gone forever. Please be certain.</p>
          </div>
          <div>
            <Button
              variant="underline"
              type="danger"
              onClick={() => onDeleteDoorway(modalState.data.id)}
            >Delete this doorway</Button>
          </div>
        </div>
      ) : null}

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
              <Button
                variant="filled"
                type="primary"
                disabled={!formValid}
                onClick={() => onSubmitModal(modalState)}
              >Save doorway</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

function DoorwayList({
  selectedSpaceId,
  doorways,
  shaded=false,
  onSelectDoorway,
  onChangeDoorwaySensorPlacement,
  onEditDoorway,
  onShowModal,
}) {
  return (
    <div className={classnames(styles.list, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          id="Doorways"
          template={item => {
            const newDoorwayCheckboxState = !item.selected;
            return (
              <Fragment>
                <Checkbox
                  checked={item.selected}
                  onChange={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                />
                <div
                  className={styles.itemContainer}
                  onClick={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                >
                  <div className={styles.icon}>
                    <Icons.Doorway width={20} height={20} color={colorVariables.gray700} />
                  </div>
                  <span className={styles.name}>{item.name}</span>
                </div>
              </Fragment>
            );
          }}
          width={360}
        />
        <ListViewColumn
          id="Linked spaces"
          template={i => {
            const spacesOtherThanSelectedSpace = i.spaces.filter(s => s.id !== selectedSpaceId);
            if (spacesOtherThanSelectedSpace.length >= 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <div className={styles.linkedSpacesIcon}>
                    <Icons.Link width={20} height={20} />
                  </div>
                  <span className={styles.linkedSpacesText}>
                    {
                      spacesOtherThanSelectedSpace.length > 1 ?
                      `${spacesOtherThanSelectedSpace.length} other spaces` :
                      spacesOtherThanSelectedSpace[0].name
                    }
                  </span>
                </div>
              );
            } else {
              return (
                <Fragment>No other spaces</Fragment>
              )
            }
          }}
          width={200}
        />
        <ListViewColumn
          id="Sensor position"
          template={i => {
            return (
              <Fragment>
                {i.sensor_placement !== null ? (
                  <Fragment>
                    <Button
                      size="small"
                      width={40}
                      height={40}
                      onClick={() => {
                        // Prompt the user for the sensor position in a modal
                        onShowModal('MODAL_SPACE_MANAGEMENT_SENSOR_POSITION', {
                          sensor_placement: i.sensor_placement, /* initial value */
                          updateHistoricCounts: true,
                          onComplete: (sensor_placement, updateHistoricCounts) => {
                            onChangeDoorwaySensorPlacement(i, sensor_placement, updateHistoricCounts);
                          },
                        });
                      }}
                    >
                      <div style={{marginTop: 6}}>
                        <Icons.Switch color={colorVariables.midnight} />
                      </div>
                    </Button>
                    <span className={styles.sensorPosition}>
                      {i.sensor_placement === 1 ? 'Inside' : 'Outside'}
                    </span>
                  </Fragment>
                ) : (
                  <Fragment>&mdash;</Fragment>
                )}
              </Fragment>
            );
          }}
          width={140}
        />
        <ListViewColumn
          id="Edit"
          title=""
          template={i => <div
            className={styles.editLink}
            onClick={() => onEditDoorway(i)}
          >
            Edit
          </div>}
          width={50}
        />
      </ListView>
    </div>
  );
}

function AdminLocationsDetailModulesDoorways({
  formState,
  activeModal,
  selectedSpaceIdOrNull,

  onChangeDoorwaysFilter,
  onChangeField,
  onSetDoorwayField,

  onShowModal,
  onHideModal,
  onUpdateModalData,
  onUpdateDoorway,
  onCreateDoorway,
  onDeleteDoorway,
}) {
  const doorwaysFilter = filterCollection({fields: ['name']});
  const filteredDoorways = doorwaysFilter(formState.doorways, formState.doorwaysFilter);

  const topDoorways = filteredDoorways.filter(x => x.list === 'TOP');
  const bottomDoorways = filteredDoorways.filter(x => x.list === 'BOTTOM');

  function onSelectDoorway(doorway, state) {
    if (state) {
      // Prompt the user for the sensor position in a modal
      onShowModal('MODAL_SPACE_MANAGEMENT_SENSOR_POSITION', {
        sensor_placement: 1 /* initial value */,
        updateHistoricCounts: false,
        onComplete: (sensor_placement, updateHistoricCounts) => {
          // And then move the doorway to the top section
          onSetDoorwayField(doorway.id, 'selected', true);
          onSetDoorwayField(doorway.id, 'sensor_placement', sensor_placement);
          onSetDoorwayField(doorway.id, 'updateHistoricCounts', updateHistoricCounts);
          onSetDoorwayField(
            doorway.id,
            'operationToPerform',
            doorway.linkExistsOnServer ? 'UPDATE' : 'CREATE',
          );
        },
      });
    } else {
      // Otherwise move the doorway back down to the bottom section
      onSetDoorwayField(doorway.id, 'selected', false);
      onSetDoorwayField(doorway.id, 'sensor_placement', null);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'DELETE' : null,
      );
    }
  }
  function onChangeDoorwaySensorPlacement(doorway, sensor_placement, updateHistoricCounts) {
    onSetDoorwayField(doorway.id, 'sensor_placement', sensor_placement);
    onSetDoorwayField(doorway.id, 'updateHistoricCounts', updateHistoricCounts);
    onSetDoorwayField(
      doorway.id,
      'operationToPerform',
      doorway.operationToPerform === 'CREATE' ? 'CREATE' : 'UPDATE',
    );
  }
  function onEditDoorway(doorway) {
    onShowModal('MODAL_SPACE_MANAGEMENT_DOORWAY', { type: 'EDIT', data: doorway });
  }

  return (
    <Fragment>
      {activeModal.name === 'MODAL_SPACE_MANAGEMENT_DOORWAY' ? (
        <AdminLocationsDetailModulesDoorwayModal
          visible={activeModal.visible}
          modalState={activeModal.data}
          space_name={formState.name}
          onUpdateModalState={onUpdateModalData}
          onCloseModal={onHideModal}
          onSubmitModal={activeModalData => {
            const data = processModalData(activeModalData.data);
            if (activeModalData.type === 'CREATE') {
              onCreateDoorway(data);
            } else {
              onUpdateDoorway(data);
            }
          }}
          onDeleteDoorway={onDeleteDoorway}
        />
      ) : null}

      {activeModal.name === 'MODAL_SPACE_MANAGEMENT_SENSOR_POSITION' ? (
        <AdminLocationsDetailModulesDoorwaySensorPositionModal
          visible={activeModal.visible}
          space_name={formState.name}
          sensor_placement={activeModal.data.sensor_placement}
          updateHistoricCounts={activeModal.data.updateHistoricCounts}
          onUpdateSensorPlacement={sensor_placement => onUpdateModalData({...activeModal, sensor_placement})}
          onUpdateHistoricCounts={updateHistoricCounts => onUpdateModalData({...activeModal, updateHistoricCounts})}
          onCloseModal={onHideModal}
          // Call a function within the modal data, this lets all the code for the modal submitting
          // be in the onSelectDoorway function above
          onSubmitModal={() => {
            onHideModal();
            activeModal.data.onComplete(
                activeModal.data.sensor_placement,
                activeModal.data.updateHistoricCounts
            );
          }}
        />
      ) : null}

      <AdminLocationsDetailModule title="Doorways" includePadding={false}>
        <AppBar>
          <AppBarSection>
            <InputBox
              leftIcon={<Icons.Search />}
              placeholder={'ex: "Doorway A", "Stairwell B"'}
              width={344}
              value={formState.doorwaysFilter}
              onChange={e => onChangeDoorwaysFilter(e.target.value)}
            />
          </AppBarSection>
          <AppBarSection>
            <Button onClick={() => onShowModal('MODAL_SPACE_MANAGEMENT_DOORWAY', {
              type: 'CREATE',
              data: {
                space_name: formState.name,
                sensor_placement: 1,
                measurementUnit: INCHES,
                width: '',
                height: '',
                clearance: null,
                power_type: POWER_OVER_ETHERNET,
              },
            })}>
              Add a new doorway
            </Button>
          </AppBarSection>
        </AppBar>
        <div className={styles.lists}>
          {topDoorways.length > 0 ? (
            <DoorwayList
              selectedSpaceId={selectedSpaceIdOrNull}
              doorways={topDoorways}
              onSelectDoorway={onSelectDoorway}
              onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
              onEditDoorway={onEditDoorway}
              onShowModal={onShowModal}
            />
          ): (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateInner}>
                {formState.doorwaysFilter.length > 0 ? (
                  <div className={styles.emptyStateInnerRight}>
                    <h3>Whoops</h3>
                    <p>We couldn't find any linked doorways that matched "{formState.doorwaysFilter}"</p>
                  </div>
                ) : (
                  <Fragment>
                    {bottomDoorways.find(i => i.selected) ? (
                      <div className={styles.emptyStateInnerRight}>
                        <h3>Great, now save this space!</h3>
                        <p>Save a doorway, save a space</p>
                      </div>
                    ) : (
                      <Fragment>
                        <div className={styles.emptyStateInnerLeft}>{DOORWAY_ICON}</div>
                        <div className={styles.emptyStateInnerRight}>
                          <h3>You haven't assigned any linked doorways to this space yet</h3>
                          <p>Start assigning and start counting</p>
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </div>
            </div>
          )}

          {bottomDoorways.length === 0 && formState.doorwaysFilter.length > 0 ? (
            <Fragment>
              <div className={classnames(styles.emptyState, styles.shaded)}>
                <div className={styles.emptyStateInner}>
                  <div className={styles.emptyStateInnerRight}>
                    <h3>Whoops</h3>
                    <p>We couldn't find any unlinked doorways that matched "{formState.doorwaysFilter}"</p>
                  </div>
                </div>
              </div>
            </Fragment>
          ): (
            <DoorwayList
              selectedSpaceId={selectedSpaceIdOrNull}
              doorways={filteredDoorways.filter(x => x.list === 'BOTTOM')}
              onSelectDoorway={onSelectDoorway}
              onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
              onEditDoorway={onEditDoorway}
              onShowModal={onShowModal}
              shaded
            />
          )}
        </div>
      </AdminLocationsDetailModule>
    </Fragment>
  );
}

// FIXME: apparently there are external props also passed to this connected component
const ConnectedAdminLocationsDetailModulesDoorways: React.FC<Any<FixInRefactor>> = (externalProps) => {

  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const spaceManagement = useRxStore(SpaceManagementStore);

  const selectedSpaceIdOrNull = spaceManagement.spaces.selected


  // formerly mapDispatchToProps
  const onHideModal = async () => {
    await hideModal(dispatch);
  }
  const onShowModal = (modalName, data = {}) => {
    showModal(dispatch, modalName, data);
  }
  const onUpdateModalData = (data: Any<FixInRefactor>) => {
    updateModal(dispatch, data);
  }
  const onCreateDoorway = async (data: Any<FixInRefactor>) => {
    await spaceManagementCreateDoorway(dispatch, data);
  }
  const onUpdateDoorway = async (data: Any<FixInRefactor>) => {
    await spaceManagementUpdateDoorway(dispatch, data);
  }
  const onDeleteDoorway = async (doorway_id) => {
    await spaceManagementDeleteDoorway(dispatch, doorway_id);
  }

  return (
    <AdminLocationsDetailModulesDoorways

      {...externalProps}

      activeModal={activeModal}
      selectedSpaceIdOrNull={selectedSpaceIdOrNull}
      
      onHideModal={onHideModal}
      onShowModal={onShowModal}
      onUpdateModalData={onUpdateModalData}
      onCreateDoorway={onCreateDoorway}
      onUpdateDoorway={onUpdateDoorway}
      onDeleteDoorway={onDeleteDoorway}
    />
  )
}
export default ConnectedAdminLocationsDetailModulesDoorways;
