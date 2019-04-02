import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import {
  Button,
  InputBox,
  Card,
  CardBody,
  RadioButton,
} from '@density/ui';

import Subnav, { SubnavItem } from '../subnav/index';

import AccountSetupHeader from '../account-setup-header/index';
import AccountSetupDoorwayDetailImageUpload from '../account-setup-doorway-detail-image-upload/index';

import collectionDoorwaysUpdate from '../../actions/collection/doorways/update';
import collectionDoorwaysCreate from '../../actions/collection/doorways/create';

import showModal from '../../actions/modal/show';

const CENTIMETERS_PER_INCH = 2.54,
  CENTIMETERS_PER_METER = 100;

const IMPERIAL = 'IMPERIAL',
  METRIC = 'METRIC';

const AC_OUTLET = 'AC_OUTLET',
  POWER_OVER_ETHERNET = 'POWER_OVER_ETHERNET';

function truncateToThreeDecimalPlaces(number) {
  return parseFloat(number.toFixed(3));
}

export class AccountSetupDoorwayDetail extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      doorway: this.props.initialDoorway,

      measurementUnit: METRIC,

      formSubmittted: false,

      // These are string representations of the width and height. Before they leave the component,
      // these values are converted to centimeters and added back into `state.doorway.{width,height}`.
      inputWidth: this.props.initialDoorway.environment && this.props.initialDoorway.environment.width ? parseFloat(this.props.initialDoorway.environment.width) * CENTIMETERS_PER_METER : '',
      inputHeight: this.props.initialDoorway.environment && this.props.initialDoorway.environment.height ? parseFloat(this.props.initialDoorway.environment.height) * CENTIMETERS_PER_METER : '',
    };
  }

  // Return the doorway in the representation returned by the core api. This method merges in fields
  // that were stored seperately (probably because they had to be stored in a different
  // representation due to data binding reasons.)
  formattedDoorway() {
    const isImperial = this.state.measurementUnit === IMPERIAL;
    const metricWidth = this.state.inputWidth * (isImperial ? CENTIMETERS_PER_INCH : 1);
    const metricHeight = this.state.inputHeight * (isImperial ? CENTIMETERS_PER_INCH : 1);
    return {
      ...this.state.doorway,
      environment: {
        ...this.state.doorway.environment,
        // Convert the width and height used by the inputs into numbers, and also convert them fro
        // mcentimeters to meters
        width: truncateToThreeDecimalPlaces(parseFloat(metricWidth.toString()) / CENTIMETERS_PER_METER),
        height: truncateToThreeDecimalPlaces(parseFloat(metricHeight.toString()) / CENTIMETERS_PER_METER),
      },
    };
  }

  isValid() {
    return (
      // Ensure that the doorway name is valid
      this.state.doorway.name && this.state.doorway.name.length > 0 &&

      // Ensure that the width and height are valid (ie, not empty and numerical)
      isNaN(parseFloat(this.state.inputWidth)) === false &&
      isNaN(parseFloat(this.state.inputHeight)) === false &&

      // Ensure that doorway clearance prompt is answered
      (this.state.doorway.environment || {}).clearance !== undefined &&
      (this.state.doorway.environment || {}).clearance !== null
    )
  }

  render() {
    // A doorway is being created if the doorway passed in is truthy and has an id key within it.
    // Otherwise, the doorway is being modified.
    const isCreatingNewDoorway = !this.state.doorway || !this.state.doorway.id;
    const needsPhotos = isCreatingNewDoorway || (
      !((this.state.doorway || {}).environment || {}).insideImageUrl &&
      !((this.state.doorway || {}).environment || {}).outsideImageUrl
    );

    return <div className={styles.accountSetupDoorwayDetail}>
      <Subnav visible>
        <SubnavItem href="#/onboarding/overview">Overview</SubnavItem>
        <SubnavItem active href="#/onboarding/doorways">Doorways</SubnavItem>
      </Subnav>

      {isCreatingNewDoorway ?
        <AccountSetupHeader
          greeter="Doorways"
          detail="Please provide more information about your doorways."
        /> :
        <AccountSetupHeader
          greeter="Edit doorway"
          detail="Edit the images, measurements or power option you selected for this doorway."
        />
      }

      <div className={styles.accountSetupDoorwayDetailBodyContainer}>
        <h1 className={styles.accountSetupDoorwayListTitle}>
          {isCreatingNewDoorway ? "Create a doorway" : this.state.doorway.name}
        </h1>
        <h3 className={styles.accountSetupDoorwayListSubtitle}>Tools needed: Tape measure</h3>

        <Card className={styles.accountSetupDoorwayDetailBody}>
          <CardBody>
            <h2 className={styles.accountSetupDoorwayDetailBodyHeader}>
              <em>1 &mdash;</em>
              Upload images
            </h2>

            {needsPhotos ? <div>
              <p className={styles.accountSetupDoorwayDetailBodySection}>
                When taking photos, please follow these guidelines:
              </p>

              <div className={styles.accountSetupDoorwayDetailBodyGuidelinesBox}>
                Stand at least 10ft away from the center of the doorway to capture the following:
                <ul>
                  <li>Full, unobstructed view of the door</li>
                  <li>Mounting space above the door</li>
                  <li>Surrounding walls</li>
                  <li>If there is a door, please prop open when capturing the image if possible</li>
                </ul>
              </div>

              <p className={styles.accountSetupDoorwayDetailBodySection}>
                Here's an example of an ideal image:
              </p>

              <div className={styles.accountSetupDoorwayDetailBodyIdealImageContainer}>
                <img
                  className={styles.accountSetupDoorwayDetailBodyIdealImage}
                  src="https://densityco.github.io/assets/images/ideal-doorway.a87e5b28.jpg"
                  alt="Ideal doorway"
                />
              </div>
            </div> : null }

            <AccountSetupDoorwayDetailImageUpload
              label="Image taken from inside the space"
              value={this.state.doorway.environment ? this.state.doorway.environment.insideImageUrl : null}
              onChange={file => {
                if (file) {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    // Update the doorway.environment.insideImageUrl
                    this.setState({
                      doorway: {
                        ...this.state.doorway,
                        environment: {
                          ...this.state.doorway.environment,
                          insideImageUrl: reader.result,
                        },
                      },
                    });
                  };
                } else {
                  // Clear out the image url inside of the envirnment if the user didn't select a
                  // user.
                  this.setState({
                    doorway: {
                      ...this.state.doorway,
                      environment: {...this.state.doorway.environment, insideImageUrl: null},
                    },
                  });
                }
              }}
            />

            <AccountSetupDoorwayDetailImageUpload
              label="Image taken from outside the space"
              value={this.state.doorway.environment ? this.state.doorway.environment.outsideImageUrl : null}
              onChange={file => {
                if (file) {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    // Update the doorway.environment.outsideImageUrl
                    this.setState({
                      doorway: {
                        ...this.state.doorway,
                        environment: {
                          ...this.state.doorway.environment,
                          outsideImageUrl: reader.result,
                        },
                      },
                    });
                  };
                } else {
                  // Clear out the image url outside of the envirnment if the user didn't select a
                  // user.
                  this.setState({
                    doorway: {
                      ...this.state.doorway,
                      environment: {...this.state.doorway.environment, outsideImageUrl: null},
                    },
                  });
                }
              }}
            />


            <h2 className={styles.accountSetupDoorwayDetailBodyHeader}>
              <em>2 &mdash;</em> Name this doorway
            </h2>
            <p className={styles.accountSetupDoorwayDetailBodySection}>
              Create a name for this doorway to be used in the Dashboard.
            </p>
            <label
              className={styles.accountSetupDoorwayDetailBodyInputLabel}
              htmlFor="account-setup-doorway-detail-body-doorway-name"
            >Doorway Name <span className={styles.accountSetupDoorwayDetailBodyInputRequired}>*</span></label>
            <div className={styles.accountSetupDoorwayDetailBodyInput}>
              <InputBox
                type="text"
                width="100%"
                placeholder="Doorway Name"
                onChange={e => this.setState({doorway: {...this.state.doorway, name: e.target.value}})}
                value={this.state.doorway.name || ''}
              />
            </div>


            <h2 className={styles.accountSetupDoorwayDetailBodyHeader}>
              <em>3 &mdash;</em>
              Measure your doorway
            </h2>
            <p className={styles.accountSetupDoorwayDetailBodySection}>
              Please provide a height and width measurement.
            </p>
            <div className={styles.accountSetupDoorwayDetailBodyGuidelinesBox}>
              <ul>
                <li>Height measurements should be from floor to top of door frame</li>
                <li>Width measurements should be from frame to frame</li>
                <li>Mounting space above door should be at least 5in</li>
              </ul>
            </div>

            <div className={styles.accountSetupDoorwayDetailBodyMeasurementRadioContainer}>
              <span className={styles.accountSetupDoorwayDetailBodyMeasurementRadioContainerItem}>
                <RadioButton
                  text="Metric"
                  checked={this.state.measurementUnit === METRIC}
                  onChange={() => {
                    const numericalInputWidth = parseFloat(this.state.inputWidth);
                    const numericalInputHeight = parseFloat(this.state.inputHeight);
                    this.setState({
                      measurementUnit: METRIC,
                      inputWidth: isNaN(numericalInputWidth) === false ? `${this.state.inputWidth * CENTIMETERS_PER_INCH}` : '',
                      inputHeight: isNaN(numericalInputHeight) === false ? `${this.state.inputHeight * CENTIMETERS_PER_INCH}` : '',
                    });
                  }}
                />
              </span>
              <RadioButton
                text="Imperial"
                checked={this.state.measurementUnit === IMPERIAL}
                onChange={() => {
                  const numericalInputWidth = parseFloat(this.state.inputWidth);
                  const numericalInputHeight = parseFloat(this.state.inputHeight);
                  this.setState({
                    measurementUnit: IMPERIAL,
                    inputWidth: isNaN(numericalInputWidth) === false ? numericalInputWidth / CENTIMETERS_PER_INCH : '',
                    inputHeight: isNaN(numericalInputHeight) === false ? numericalInputHeight / CENTIMETERS_PER_INCH : '',
                  });
                }}
              />
            </div>
            <br/>

            <label className={styles.accountSetupDoorwayDetailBodyInputLabel}>
              Doorway Width <span className={styles.accountSetupDoorwayDetailBodyInputRequired}>*</span>
              <span className={styles.accountSetupDoorwayDetailBodyInputLabelHighlight}>
                {this.state.measurementUnit === METRIC ? '(Centimeters)' : '(Inches)'}
              </span>
            </label>
            <div className={styles.accountSetupDoorwayDetailBodyInput}>
              <InputBox
                type="tel"
                width="100%"
                placeholder={this.state.measurementUnit === METRIC ? 'cm' : 'inches'}
                value={this.state.inputWidth}
                onChange={e => this.setState({inputWidth: e.target.value})}
              />
            </div>

            <br/>
            <label className={styles.accountSetupDoorwayDetailBodyInputLabel}>
              Doorway Height <span className={styles.accountSetupDoorwayDetailBodyInputRequired}>*</span>
              <span className={styles.accountSetupDoorwayDetailBodyInputLabelHighlight}>
                {this.state.measurementUnit === METRIC ? '(Centimeters)' : '(Inches)'}
              </span>
            </label>
            <div className={styles.accountSetupDoorwayDetailBodyInput}>
              <InputBox
                type="tel"
                width="100%"
                placeholder={this.state.measurementUnit === METRIC ? 'cm' : 'inches'}
                value={this.state.inputHeight}
                onChange={e => this.setState({inputHeight: e.target.value})}
              />
            </div>

            <br/>
            <label
              className={`${styles.accountSetupDoorwayDetailBodyInputLabel} ${styles.mountingSpace}`}
            >Mounting Space <span className={styles.accountSetupDoorwayDetailBodyInputRequired}>*</span></label>
            <p className={styles.accountSetupDoorwayDetailBodySectionClearance}>
              Does this doorway have at least 5in (0.13m) of clearance above the door to mount a unit?
            </p>

            <div className={styles.accountSetupDoorwayDetailBodyClearanceRadioContainer}>
              <span className={styles.accountSetupDoorwayDetailBodyClearanceRadioContainerItem}>
                <RadioButton
                  text="Yes"
                  checked={this.state.doorway.environment ? this.state.doorway.environment.clearance === true : false}
                  onChange={() => this.setState({
                    doorway: {
                      ...this.state.doorway,
                      environment: {...this.state.doorway.environment, clearance: true},
                    },
                  })}
                />
              </span>
              <RadioButton
                text="No"
                checked={this.state.doorway.environment ? this.state.doorway.environment.clearance === false : false}
                onChange={() => this.setState({
                  doorway: {
                    ...this.state.doorway,
                    environment: {...this.state.doorway.environment, clearance: false},
                  },
                })}
              />
            </div>

            <MountingSpaceGraphic />

            <h2 className={styles.accountSetupDoorwayDetailBodyHeader}>
              <em>4 &mdash;</em>
              Choose a power option
            </h2>

            <p className={styles.accountSetupDoorwayDetailBodySectionClearance}>
              (Optional) How will you power the unit?
            </p>
            <RadioButton
              text="Power over Ethernet (803.2at PoE+)"
              checked={this.state.doorway.environment ? this.state.doorway.environment.powerType === POWER_OVER_ETHERNET : false}
              onChange={() => this.setState({
                doorway: {
                  ...this.state.doorway,
                  environment: {...this.state.doorway.environment, powerType: POWER_OVER_ETHERNET},
                },
              })}
            />
            <div className={styles.accountSetupDoorwayDetailBodyPowerRadioButtonSpacer} />
            <RadioButton
              text="Standard 100-240V AC outlet"
              checked={this.state.doorway.environment ? this.state.doorway.environment.powerType === AC_OUTLET : false}
              onChange={() => this.setState({
                doorway: {
                  ...this.state.doorway,
                  environment: {...this.state.doorway.environment, powerType: AC_OUTLET},
                },
              })}
            />
            <br/>
            <br/>
            <br/>
            <br/>

            <Button
              type="primary"
              width={isCreatingNewDoorway ? 'auto' : '100%'}
              onClick={() => {
                // Set a flag to disable the submit buttons while the form is sending data to the
                // server.
                this.setState({formSubmittted: true});

                return this.props.onSave(this.formattedDoorway.apply(this)).then(ok => {
                  // Once complete, show the doorway success toast using the modal reducer.
                  if (ok) {
                    this.props.openDoorwaySavedModal();
                  }

                  // Once complete, scroll to top and redirect back to the main page.
                  document.body.scrollTop = document.documentElement.scrollTop = 0;
                  window.location.href = '#/onboarding/doorways';
                });
              }}

              disabled={!this.isValid.apply(this) || this.state.formSubmittted}
            >Save &amp; Close</Button>
            &nbsp;&nbsp;
            { isCreatingNewDoorway ?
              <Button
                className={styles.accountSetupDoorwayDetailSaveAddAnotherButton}
                onClick={() => {
                  // Set a flag to disable the submit buttons while the form is sending data to the
                  // server.
                  this.setState({formSubmittted: true});

                  return this.props.onSave(this.formattedDoorway.apply(this)).then(() => {
                    // Once complete, reset the state of the form.
                    this.setState({
                      doorway: {},
                      formSubmittted: false,
                      inputWidth: '',
                      inputHeight: '',
                    });

                    // Once complete, scroll to top and redirect to new doorway page
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    window.location.href = '#/onboarding/doorways/new';
                  });
                }}
                disabled={!this.isValid.apply(this) || this.state.formSubmittted}
              >Save &amp; Add Another Doorway</Button>
            : null }
          </CardBody>
        </Card>
      </div>
    </div>;
  }
}

function MountingSpaceGraphic() {
  return <svg
    className={styles.accountSetupDoorwayDetailClearanceGraphic}
    width="422px"
    height="217px"
    viewBox="0 0 422 217"
    version="1.1"
  >
    <g id="Onboarding-Web" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="ob-v1-r1-004-1" transform="translate(-429.000000, -2535.000000)">
            <g id="content" transform="translate(410.000000, 370.000000)">
                <g id="step-3" transform="translate(20.000000, 1519.000000)">
                    <g id="scene" transform="translate(0.000000, 650.000000)">
                        <rect id="door" stroke="#B4B8BF" fill="#F5F6F7" strokeLinecap="round" strokeLinejoin="round" x="0" y="61.4299828" width="420" height="154.078481"></rect>
                        <rect id="door" stroke="#B4B8BF" fill="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" x="21.0501193" y="82.5780097" width="378.902148" height="132.930455"></rect>
                        <g id="r60-front" transform="translate(185.441527, 28.197369)" stroke="#B4B8BF">
                            <path d="M15.3787213,11.0775379 L37.7477704,11.0775379 L37.7477704,31.2326136 L37.7477704,31.2326136 C37.7477704,32.3371831 36.8523399,33.2326136 35.7477704,33.2326136 L17.3787213,33.2326136 L17.3787213,33.2326136 C16.2741518,33.2326136 15.3787213,32.3371831 15.3787213,31.2326136 L15.3787213,11.0775379 Z" id="mount" fill="#F5F6F7" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M0.162956884,20.7703835 C1.30923909,22.6166398 2.29345712,23.539768 3.11561097,23.539768 C4.34884174,23.539768 48.5271043,23.3910693 49.8183736,23.3910693 C50.6792198,23.3910693 51.7517142,22.5175074 53.0358569,20.7703835 L0.162956884,20.7703835 Z" id="window" fill="#B4B8BF" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M0.965858065,2.85340573 C0.54871463,5.70544631 0.266651737,8.56472301 0.119669386,11.4312358 C-0.0398897952,14.5430274 -0.0398897952,17.6560766 0.119669386,20.7703835 L53.0227182,20.7703835 C53.1610828,17.6282524 53.1610828,14.5084501 53.0227182,11.4109765 C52.8952077,8.55648453 52.6493786,5.70281009 52.2852309,2.84995315 L52.2852338,2.84995279 C52.2297872,2.41556544 51.8981613,2.06778413 51.4669003,1.99175359 C43.935141,0.663917864 35.9940108,0 27.6435097,0 C19.2560581,0 10.6433742,0.669806479 1.80545792,2.00941944 L1.80545924,2.00942813 C1.37037955,2.07537561 1.02954271,2.41798907 0.965858065,2.85340573 Z" id="enclosure" fill="#F5F6F7" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M1.39806557,4.15407671 C9.78645899,3.23094855 18.1748524,2.76938447 26.5632458,2.76938447 C34.9516392,2.76938447 43.3400327,3.23094855 51.7284261,4.15407671" id="curve" strokeWidth="0.5" strokeDasharray="2"></path>
                        </g>
                        <g id="measurements" transform="translate(105.250597, 0.000000)">
                            <polyline id="Path-11" stroke="#4198FF" points="56.9945046 61.0564073 46.1018586 61.0564073 46.1018586 0.00272682807 56.9945046 0.00272682807"></polyline>
                            <text id="5-in" fontFamily=".AppleSystemUIFont" fontSize="14" fontWeight="normal" fill="#4198FF">
                                <tspan x="5.54118889" y="30.4533413">5 in</tspan>
                            </text>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
  </svg>
}

export default connect((state: any) => {
  return {
    initialDoorway: state.doorways.selected === 'new' ? {} :
      state.doorways.data.find(doorway => doorway.id === state.doorways.selected),
    doorwayCollectionLoading: state.doorways.loading,
  };
}, dispatch => {
  return {
    async onSave(doorway) {

      function dataURItoBlob(dataURI) {
        // Convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // Separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // Write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
    
        return new Blob([ia], {type:mimeString});
      }

      function uploadImage(url, blob) {
        // Build authorization and content-type headers
        const headers = new Headers({
          'Authorization': `Bearer ${JSON.parse(localStorage.sessionToken)}`,
          'Content-Type': blob.type,
        })
        // PUT image to the URL
        return fetch(url, { method: 'PUT', headers: headers, body: blob });
      }

      // Make first call to POST/PUT doorway
      let firstCall;
      if (doorway.id) {
        firstCall = await dispatch<any>(collectionDoorwaysUpdate(doorway));
      } else {
        firstCall = await dispatch<any>(collectionDoorwaysCreate(doorway));
      }

      // Then upload any new doorway images
      const imageCalls: any[] = [];
      if (doorway.environment.insideImageUrl && doorway.environment.insideImageUrl.startsWith('data:')) {
        imageCalls.push(uploadImage(
          `https://api.density.io/v2/doorways/${firstCall.id}/images/inside/`,
          dataURItoBlob(doorway.environment.insideImageUrl)
        ));
      }
      if (doorway.environment.outsideImageUrl && doorway.environment.outsideImageUrl.startsWith('data:')) {
        imageCalls.push(uploadImage(
          `https://api.density.io/v2/doorways/${firstCall.id}/images/outside/`,
          dataURItoBlob(doorway.environment.outsideImageUrl)
        ));
      }

      // Return promises
      return Promise.all(imageCalls);
    },

    openDoorwaySavedModal() {
      dispatch<any>(showModal('unit-setup-added-doorway'));
    },
  };
})(function AccountSetupDoorwayDetailWrapper(props: any) {
  if (typeof props.initialDoorway !== 'undefined') {
    return <AccountSetupDoorwayDetail {...props} />;
  } else {
    return <div className={styles.accountSetupDoorwayDetailLoading}>Loading ...</div>;
  }
});
