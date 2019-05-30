import React, { Fragment } from 'react';
import { connect } from 'react-redux';
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
              onClick={() => onEditDoorway(i)}
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

function AdminLocationsDetailModulesDoorways({
  formState,
  activeModal,

  onChangeDoorwaysFilter,
  onChangeField,
  onSetDoorwayField,

  onShowDoorwaysModal,
  onHideModal,
  onUpdateModalData,
  onUpdateDoorway,
  onCreateDoorway,
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
  function onEditDoorway(doorway) {
    onShowDoorwaysModal({ type: 'EDIT', data: doorway });
  }

  return (
    <Fragment>
      {activeModal.name === 'MODAL_SPACE_MANAGEMENT_DOORWAY' ? (
        <AdminLocationsDetailModulesDoorwayModal
          visible={activeModal.visible}
          modalState={activeModal.data}
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
        />
      ) : null}

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
            <Button onClick={() => onShowDoorwaysModal({
              type: 'CREATE',
              data: {
                spaceName: formState.name,
                sensorPlacement: 1,
                measurementUnit: INCHES,
                width: '',
                height: '',
                clearance: null,
                powerType: POWER_OVER_ETHERNET,
              },
            })}>
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
    </Fragment>
  );
}

export default connect((state: any) => ({
  activeModal: state.activeModal,
}), dispatch => ({
  onHideModal() {
    dispatch<any>(hideModal());
  },
  onShowDoorwaysModal(data={}) {
    dispatch<any>(showModal('MODAL_SPACE_MANAGEMENT_DOORWAY', data))
  },
  onUpdateModalData(data) {
    dispatch<any>(updateModal(data));
  },

  onCreateDoorway(data) {
    dispatch<any>(spaceManagementCreateDoorway(data));
  },
  onUpdateDoorway(data) {
    dispatch<any>(spaceManagementUpdateDoorway(data));
  },
}))(AdminLocationsDetailModulesDoorways);


const DOORWAY_ICON = (
	<svg width="93px" height="108px" viewBox="0 0 93 108">
			<g id="Admin:-Locations-(release)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					<g id="org.locations.space.edit" transform="translate(-479.000000, -1561.000000)">
							<g id="doorways" transform="translate(298.000000, 1358.000000)">
									<g id="empty-message" transform="translate(182.000000, 204.000000)">
											<g id="alarm-thing">
													<circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="73" cy="31" r="3"></circle>
													<g id="chat" transform="translate(64.000000, 0.000000)">
															<path d="M0,18 L4,14 L4,2 C4,0.8954305 4.8954305,2.02906125e-16 6,0 L25,0 C26.1045695,-2.02906125e-16 27,0.8954305 27,2 L27,16 C27,17.1045695 26.1045695,18 25,18 L6,18 L0,18 Z" id="Path" stroke="#D7D7D7" strokeWidth="2" strokeLinejoin="round"></path>
															<text id="+1" fontFamily="Aeonik-Medium, Aeonik" fontSize="12" fontWeight="400" fill="#BFBFBF">
																	<tspan x="8" y="13">+1</tspan>
															</text>
													</g>
													<path d="M19.3796296,105.526012 L19.3796296,32 L58.6388889,32 L58.6388889,105.526012 L70.4166667,105.526012 L7.60185185,105.526012 L19.3796296,105.526012 Z M29,76 C30.6568542,76 32,74.6568542 32,73 C32,71.3431458 30.6568542,70 29,70 C27.3431458,70 26,71.3431458 26,73 C26,74.6568542 27.3431458,76 29,76 Z" id="Combined-Shape" stroke="#D7D7D7" strokeWidth="2"></path>
													<circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="3" cy="21" r="3"></circle>
													<circle id="Oval" fill="#D8D8D8" cx="30.5" cy="24.5" r="1.5"></circle>
											</g>
									</g>
							</g>
					</g>
			</g>
	</svg>
);

const MOUNTING_SPACE_GLYPH = (
  <svg width={352} height={103}>
    <g fill="none" fillRule="evenodd">
      <image
        width={352}
        height={103}
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA6wAAAEUCAYAAAAvPbt1AAAMSWlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnltSSWiBCEgJvYlSpEsJoUUQkCrYCEkgocSYEETsyqKCaxcRUFd0VUTRtQCyVtS1Loq9PxRRUVaxYEPlTQrout9773vn++beP2fO+U/J3HtnANCp5kmluaguAHmSfFl8RAhrXGoai9QBEKAFKMAJ4Dy+XMqOi4sGUAbuf5d316E1lCsuSq5/zv9X0RMI5XwAkDiIMwRyfh7E+wHAi/lSWT4ARB+ot56WL1XiCRAbyGCCEEuVOEuNi5U4Q40rVDaJ8RyIdwJApvF4siwAtJugnlXAz4I82jchdpUIxBIAdMgQB/JFPAHEkRAPy8ubosTQDjhkfMeT9TfOjEFOHi9rEKtrUQk5VCyX5vKm/5/t+N+Sl6sYiGEHB00ki4xX1gz7djNnSpQS0yDulmTExEKsD/EHsUBlDzFKFSkik9T2qClfzoE9A0yIXQW80CiITSEOl+TGRGv0GZnicC7EcIWgheJ8bqLGd5FQHpag4ayWTYmPHcCZMg5b41vPk6niKu1PKnKS2Br+myIhd4D/bZEoMUWdM0YtECfHQKwNMVOekxCltsFsikScmAEbmSJemb8NxH5CSUSImh+blCkLj9fYy/LkA/Vii0RibowGV+aLEiM1PDv5PFX+RhA3CSXspAEeoXxc9EAtAmFomLp27JJQkqSpF2uX5ofEa3xfS3PjNPY4VZgbodRbQWwqL0jQ+OKB+XBBqvnxGGl+XKI6Tzwjmzc6Tp0PXgiiAQeEAhZQwJEBpoBsIG7tbuyGv9Qz4YAHZCALCIGLRjPgkaKakcBrAigCf0EkBPJBvxDVrBAUQP2XQa366gIyVbMFKo8c8BjiPBAFcuFvhcpLMhgtGTyCGvE/ovNhrrlwKOf+qWNDTbRGoxjgZekMWBLDiKHESGI40RE3wQNxfzwaXoPhcMd9cN+BbL/ZEx4T2ggPCdcI7YRbk8XzZT/UwwJjQDuMEK6pOeP7mnE7yOqJh+ABkB9y40zcBLjgI2EkNh4EY3tCLUeTubL6H7n/VsN3XdfYUVwpKGUIJZji8KOntpO25yCLsqffd0ida8ZgXzmDMz/G53zXaQG8R/1oiS3C9mGnsePYWewQ1ghY2FGsCbuAHVbiwVX0SLWKBqLFq/LJgTzif8TjaWIqOyl3rXPtcv2snssXFirfj4AzRTpdJs4S5bPY8M0vZHEl/OHDWO6ubr4AKL8j6tfUG6bq+4Awz33TLVgIQEBtf3//7990UZ0A7HsJAPXeN519NnwdiAA4s4avkBWodbjyQgBUoAOfKGNgDqyBA6zHHXgBfxAMwsBoEAsSQSqYBLssgutZBqaBmWAeKAFlYDlYAyrBRrAZbAe7wF7QCA6B4+APcB5cAtfAHbh6OsFz0APegT4EQUgIHWEgxogFYos4I+6IDxKIhCHRSDySiqQjWYgEUSAzkQVIGbISqUQ2IbXIb8hB5DhyFmlDbiEPkC7kNfIJxVAaaoCaoXboCNQHZaNRaCI6Ec1Cp6JFaDG6FK1Aa9CdaAN6HD2PXkPb0edoLwYwLYyJWWIumA/GwWKxNCwTk2GzsVKsHKvB6rFm+D9fwdqxbuwjTsQZOAt3gSs4Ek/C+fhUfDa+BK/Et+MN+En8Cv4A78G/EugEU4IzwY/AJYwjZBGmEUoI5YSthAOEU/Bp6iS8IxKJTKI90Rs+janEbOIM4hLieuJu4jFiG7GD2EsikYxJzqQAUiyJR8onlZDWkXaSjpIukzpJH8haZAuyOzmcnEaWkOeTy8k7yEfIl8lPyH0UXYotxY8SSxFQplOWUbZQmikXKZ2UPqoe1Z4aQE2kZlPnUSuo9dRT1LvUN1paWlZavlpjtcRac7UqtPZondF6oPWRpk9zonFoE2gK2lLaNtox2i3aGzqdbkcPpqfR8+lL6bX0E/T79A/aDO3h2lxtgfYc7SrtBu3L2i90KDq2OmydSTpFOuU6+3Qu6nTrUnTtdDm6PN3ZulW6B3Vv6PbqMfTc9GL18vSW6O3QO6v3VJ+kb6cfpi/QL9bfrH9Cv4OBMawZHAafsYCxhXGK0WlANLA34BpkG5QZ7DJoNegx1DccaZhsWGhYZXjYsJ2JMe2YXGYucxlzL/M689MQsyHsIcIhi4fUD7k85L3RUKNgI6FRqdFuo2tGn4xZxmHGOcYrjBuN75ngJk4mY02mmWwwOWXSPdRgqP9Q/tDSoXuH3jZFTZ1M401nmG42vWDaa2ZuFmEmNVtndsKs25xpHmyebb7a/Ih5lwXDItBCbLHa4qjFM5Yhi83KZVWwTrJ6LE0tIy0VlpssWy37rOytkqzmW+22umdNtfaxzrRebd1i3WNjYTPGZqZNnc1tW4qtj63Idq3tadv3dvZ2KXYL7Rrtntob2XPti+zr7O860B2CHKY61DhcdSQ6+jjmOK53vOSEOnk6iZyqnC46o85ezmLn9c5twwjDfIdJhtUMu+FCc2G7FLjUuTwYzhwePXz+8MbhL0bYjEgbsWLE6RFfXT1dc123uN5x03cb7TbfrdnttbuTO9+9yv2qB90j3GOOR5PHq5HOI4UjN4y86cnwHOO50LPF84uXt5fMq96ry9vGO9272vuGj4FPnM8SnzO+BN8Q3zm+h3w/+nn55fvt9Xvp7+Kf47/D/+ko+1HCUVtGdQRYBfACNgW0B7IC0wN/CWwPsgziBdUEPQy2DhYEbw1+wnZkZ7N3sl+EuIbIQg6EvOf4cWZxjoVioRGhpaGtYfphSWGVYffDrcKzwuvCeyI8I2ZEHIskREZFroi8wTXj8rm13J7R3qNnjT4ZRYtKiKqMehjtFC2Lbh6Djhk9ZtWYuzG2MZKYxlgQy41dFXsvzj5uatzvY4lj48ZWjX0c7xY/M/50AiNhcsKOhHeJIYnLEu8kOSQpklqSdZInJNcmv08JTVmZ0j5uxLhZ486nmqSKU5vSSGnJaVvTeseHjV8zvnOC54SSCdcn2k8snHh2ksmk3EmHJ+tM5k3el05IT0nfkf6ZF8ur4fVmcDOqM3r4HP5a/nNBsGC1oEsYIFwpfJIZkLky82lWQNaqrC5RkKhc1C3miCvFr7Ijszdmv8+JzdmW05+bkrs7j5yXnndQoi/JkZycYj6lcEqb1FlaIm2f6jd1zdQeWZRsqxyRT5Q35RvADfsFhYPiJ8WDgsCCqoIP05Kn7SvUK5QUXpjuNH3x9CdF4UW/zsBn8Ge0zLScOW/mg1nsWZtmI7MzZrfMsZ5TPKdzbsTc7fOo83Lm/Tnfdf7K+W8XpCxoLjYrnlvc8VPET3Ul2iWykhsL/RduXIQvEi9qXeyxeN3ir6WC0nNlrmXlZZ+X8Jec+9nt54qf+5dmLm1d5rVsw3Licsny6yuCVmxfqbeyaGXHqjGrGlazVpeufrtm8pqz5SPLN66lrlWsba+IrmhaZ7Nu+brPlaLKa1UhVburTasXV79fL1h/eUPwhvqNZhvLNn76RfzLzU0Rmxpq7GrKNxM3F2x+vCV5y+lffX6t3WqytWzrl22Sbe3b47efrPWurd1humNZHVqnqOvaOWHnpV2hu5rqXeo37WbuLtsD9ij2PPst/bfre6P2tuzz2Ve/33Z/9QHGgdIGpGF6Q0+jqLG9KbWp7eDogy3N/s0Hfh/++7ZDloeqDhseXnaEeqT4SP/RoqO9x6THuo9nHe9omdxy58S4E1dPjj3Zeirq1Jk/wv84cZp9+uiZgDOHzvqdPXjO51zjea/zDRc8Lxz40/PPA61erQ0XvS82XfK91Nw2qu3I5aDLx6+EXvnjKvfq+Wsx19quJ12/eWPCjfabgptPb+XeenW74Hbfnbl3CXdL7+neK79ver/mX47/2t3u1X74QeiDCw8THt7p4Hc8fyR/9Lmz+DH9cfkTiye1T92fHuoK77r0bPyzzufS533dJX/p/VX9wuHF/pfBLy/0jOvpfCV71f96yRvjN9vejnzb0hvXe/9d3ru+96UfjD9s/+jz8fSnlE9P+qZ9Jn2u+OL4pflr1Ne7/Xn9/VKejKfaCmBwoJmZALzeBgA9FQDGJbh/GK8+56kEUZ9NVQj8J6w+C6rEC4B6eFNu1znHANgDh10w5J4LgHKrnhgMUA+PwaEReaaHu5qLBk88hA/9/W/MACA1A/BF1t/ft76//8sWmOwtAI5NVZ8vlUKEZ4NfApXompFgLvhB/g2SAoBdXDvJNgAAIIxJREFUeAHt3Y1vHOWdB/Bn7fVbYueVEBIohAClFQiKUCmnSpXuL7/T6e7aqqpOp9OpXI9eaUNCQgmxEyd+jX3PM+txbMcu9thjP8/MZySz69md2d/z+S2Y7z4zs4PNuAQLAQIECBAgQIAAAQIECBDITGAss3qUQ4AAAQIECBAgQIAAAQIEKgGB1RuBAAECBAgQIECAAAECBLIUEFizbIuiCBAgQIAAAQIECBAgQEBg9R4gQIAAAQIECBAgQIAAgSwFBNYs26IoAgQIECBAgAABAgQIEBBYvQcIECBAgAABAgQIECBAIEsBgTXLtiiKAAECBAgQIECAAAECBARW7wECBAgQIECAAAECBAgQyFJAYM2yLYoiQIAAAQIECBAgQIAAAYHVe4AAAQIECBAgQIAAAQIEshQQWLNsi6IIECBAgAABAgQIECBAQGD1HiBAgAABAgQIECBAgACBLAUE1izboigCBAgQIECAAAECBAgQEFi9BwgQIECAAAECBAgQIEAgSwGBNcu2KIoAAQIECBAgQIAAAQIEBFbvAQIECBAgQIAAAQIECBDIUkBgzbItiiJAgAABAgQIECBAgAABgdV7gAABAgQIECBAgAABAgSyFBBYs2yLoggQIECAAAECBAgQIEBAYPUeIECAAAECBAgQIECAAIEsBQTWLNuiKAIECBAgQIAAAQIECBAQWL0HCBAgQIAAAQIECBAgQCBLAYE1y7YoigABAgQIECBAgAABAgQEVu8BAgQIECBAgAABAgQIEMhSQGDNsi2KIkCAAAECBAgQIECAAAGB1XuAAAECBAgQIECAAAECBLIUEFizbIuiCBAgQIAAAQIECBAgQEBg9R4gQIAAAQIECBAgQIAAgSwFBNYs26IoAgQIECBAgAABAgQIEBgiIECAQC0wiEt93y2BkxbYjMtJ79P+CBAgQIAAgW4LmGHtdn+NjgABAgQIECBAgAABAsUKCKzFtk7hBAgQIECAAAECBAgQ6LaAwNrt/hodAQIECBAgQIAAAQIEihUQWIttncIJECBAgAABAgQIECDQbQGBtdv9NToCBAgQIECAAAECBAgUKyCwFts6hRMgQIAAAQIECBAgQKDbAgJrt/trdAQIECBAgAABAgQIEChWQGAttnUKJ0CAAAECBAgQIECAQLcFBNZu99foCBAgQIAAAQIECBAgUKyAwFps6xROgAABAgQIECBAgACBbgsIrN3ur9ERIECAAAECBAgQIECgWAGBtdjWKZwAAQIECBAgQIAAAQLdFhBYu91foyNAgAABAgQIECBAgECxAgJrsa1TOAECBAgQIECAAAECBLotILB2u79GR4AAAQIECBAgQIAAgWIFBNZiW6dwAgQIECBAgAABAgQIdFtAYO12f42OAAECBAgQIECAAAECxQoIrMW2TuEECBAgQIAAAQIECBDotoDA2u3+Gh0BAgQIECBAgAABAgSKFRBYi22dwgkQIECAAAECBAgQINBtAYG12/01OgIECBAgQIAAAQIECBQrILAW2zqFEyBAgAABAgQIECBAoNsCAmu3+2t0BAgQIECAAAECBAgQKFZAYC22dQonQIAAAQIECBAgQIBAtwUE1m731+gIECBAgAABAgQIECBQrIDAWmzrFE6AAAECBAgQIECAAIFuCwis3e6v0REgQIAAAQIECBAgQKBYAYG12NYpnAABAgQIECBAgAABAt0WEFi73V+jI0CAAAECBAgQIECAQLECAmuxrVM4AQIECBAgQIAAAQIEui0gsHa7v0ZHgAABAgQIECBAgACBYgUE1mJbp3ACBAgQIECAAAECBAh0W0Bg7XZ/jY4AAQIECBAgQIAAAQLFCgisxbZO4QQIECBAgAABAgQIEOi2gMDa7f4aHQECBAgQIECAAAECBIoVEFiLbZ3CCRAgQIAAAQIECBAg0G0BgbXb/TU6AgQIECBAgAABAgQIFCsgsBbbOoUTIECAAAECBAgQIECg2wICa7f7a3QECBAgQIAAAQIECBAoVkBgLbZ1CidAgAABAgQIECBAgEC3BQTWbvfX6AgQIECAAAECBAgQIFCsgMBabOsUToAAAQIECBAgQIAAgW4LCKzd7q/RESBAgAABAgQIECBAoFgBgbXY1imcAAECBAgQIECAAAEC3RYQWLvdX6MjQIAAAQIECBAgQIBAsQICa7GtUzgBAgQIECBAgAABAgS6LSCwdru/RkeAAAECBAgQIECAAIFiBQTWYluncAIECBAgQIAAAQIECHRbQGDtdn+NjgABAgQIECBAgAABAsUKCKzFtk7hBAgQIECAAAECBAgQ6LaAwNrt/hodAQIECBAgQIAAAQIEihUQWIttncIJECBAgAABAgQIECDQbQGBtdv9NToCBAgQIECAAAECBAgUKyCwFts6hRMgQIAAAQIECBAgQKDbAgJrt/trdAQIECBAgAABAgQIEChWQGAttnUKJ0CAAAECBAgQIECAQLcFBNZu99foCBAgQIAAAQIECBAgUKyAwFps6xROgAABAgQIECBAgACBbgsIrN3ur9ERIECAAAECBAgQIECgWAGBtdjWKZwAAQIECBAgQIAAAQLdFhBYu91foyNAgAABAgQIECBAgECxAgJrsa1TOAECBAgQIECAAAECBLotILB2u79GR4AAAQIECBAgQIAAgWIFBNZiW6dwAgQIECBAgAABAgQIdFtAYO12f42OAAECBAgQIECAAAECxQoIrMW2TuEECBAgQIAAAQIECBDotoDA2u3+Gh0BAgQIECBAgAABAgSKFRBYi22dwgkQIECAAAECBAgQINBtAYG12/01OgIECBAgQIAAAQIECBQrILAW2zqFEyBAgAABAgQIECBAoNsCAmu3+2t0BAgQIECAAAECBAgQKFZAYC22dQonQIAAAQIECBAgQIBAtwUE1m731+gIECBAgAABAgQI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AgQIECBAgAABAv0UEFj72XejJkCAAAECBAgQIECAQPYCAmv2LVIgAQIECBAgQIAAAQIE+ikgsPaz70ZNgAABAgQIECBAgACB7AUE1uxbpEACBAgQIECAAAECBAj0U0Bg7WffjZoAAQIECBAgQIAAAQLZCwis2bdIgQQIECBAgAABAgQIEOingMDaz74bNQECBAgQIECAAAECBLIXEFizb5ECCRAgQIAAAQIECBAg0E8BgbWffTdqAgQIECBAgAABAgQIZC8gsGbfIgUSIECAAAECBAgQIECgnwICaz/7btQECBAgQIAAAQIECBDIXkBgzb5FCiRAgAABAgQIECBAgEA/BQTWfvbdqAkQIECAAAECBAgQIJC9gMCafYsUSIAAAQIECBAgQIAAgX4KCKz97LtREyBAgAABAgQIECBAIHsBgTX7FimQAAECBAgQIECAAAEC/RQQWPvZd6MmQIAAAQIECBAgQIBA9gICa/YtUiABAgQIECBAgAABAgT6KTDs57DzHvUX//NlWF5eybtI1REgQIAAAQIECBAg8IMCc3Oz4Z3bb/3g8zxhfwGBdX+XM117/8HfzvT1vTgBAgQIECBAgAABAicjML/wWGA9BqXAegy8tjf9xc8/afsl7J8AAQIECBAgQIAAgZYEfvu7/2hpz/3ZrcCaca+vXrmUcXVKI0CAAAECBAgQIECAQLsCLrrUrq+9EyBAgAABAgQIECBAgEBDAYG1IZzNCBAgQIAAAQIECBAgQKBdAYG1XV97J0CAAAECBAgQIECAAIGGAgJrQzibESBAgAABAgQIECBAgEC7AgJru772ToAAAQIECBAgQIAAAQINBQTWhnA2I0CAAAECBAgQIECAAIF2BQTWdn3tnQABAgQIECBAgAABAgQaCgisDeFsRoAAAQIECBAgQIAAAQLtCgis7fraOwECBAgQIECAAAECBAg0FBBYG8LZjAABAgQIECBAgAABAgTaFRBY2/W1dwIECBAgQIAAAQIECBBoKCCwNoSzGQECBAgQIECAAAECBAi0KyCwtutr7wQIECBAgAABAgQIECDQUEBgbQhnMwIECBAgQIAAAQIECBBoV0BgbdfX3gkQIECAAAECBAgQIECgoYDA2hDOZgQIECBAgAABAgQIECDQroDA2q6vvRMgQIAAAQIECBAgQIBAQwGBtSGczQgQIECAAAECBAgQIECgXQGBtV1feydAgAABAgQIECBAgACBhgICa0M4mxEgQIAAAQIECBAgQIBAuwICa7u+9k6AAAECBAgQIECAAAECDQUE1oZwNiNAgAABAgQIECBAgACBdgUE1nZ97Z0AAQIECBAgQIAAAQIEGgoIrA3hbEaAAAECBAgQIECAAAEC7QoIrO362jsBAgQIECBAgAABAgQINBQQWBvC2YwAAQIECBAgQIAAAQIE2hUQWNv1tXcCBAgQIECAAAECBAgQaCggsDaEsxkBAgQIECBAgAABAgQItCsgsLbra+8ECBAgQIAAAQIECBAg0FBAYG0IZzMCBAgQIECAAAECBAgQaFdAYG3X194JECBAgAABAgQIECBAoKGAwNoQzmYECBAgQIAAAQIECBAg0K6AwNqur70TIECAAAECBAgQIECAQEMBgbUhnM0IECBAgAABAgQIECBAoF0BgbVdX3snQIAAAQIECBAgQIAAgYYCAmtDOJsRIECAAAECBAgQIECAQLsCAmu7vvZOgAABAgQIECBAgAABAg0FBNaGcDYjQIAAAQIECBAgQIAAgXYFBNZ2fe2dAAECBAgQIECAAAECBBoKCKwN4WxGgAABAgQIECBAgAABAu0KCKzt+to7AQIECBAgQIAAAQIECDQUEFgbwtmMAAECBAgQIECAAAECBNoVEFjb9bV3AgQIECBAgAABAgQIEGgoILA2hLMZAQIECBAgQIAAAQIECLQrILC262vvBAgQIECAAAECBAgQINBQQGBtCGczAgQIECBAgAABAgQIEGhXQGBt19feCRAgQIAAAQIECBAgQKChgMDaEM5mBAgQIECAAAECBAgQINCugMDarq+9EyBAgAABAgQIECBAgEBDAYG1IZzNCBAgQIAAAQIECBAgQKBdAYG1XV97J0CAAAECBAgQIECAAIGGAgJrQzibESBAgAABAgQIECBAgEC7Av8Pn5juRUsxq/kAAAAASUVORK5CYII=" /> <path stroke="#2E51B6" d="M144 67h-8V17h8" />
      <text
        fontFamily="Aeonik-Medium, Aeonik"
        fontSize={12}
        fontWeight={400}
        fill="#2E51B6"
      >
        <tspan x={105} y={44}>
          {'5 in'}
        </tspan>
      </text>
    </g>
  </svg>
);
