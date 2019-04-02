import styles from './styles.module.scss';

import React from 'react';

// All the possible states that this component can be rendered in.
export const UPLOADED = 'UPLOADED',
      NO_FILES = 'NO_FILES',
      MULTIPLE_FILES = 'MULTIPLE_FILES';

export default class AccountSetupDoorwayDetailImageUpload extends React.Component<any, any> {
  fileinput: any;
  
  constructor(props) {
    super(props);

    this.state = {
      view: this.calculateViewGivenProps.call(this, props),
    };
  }

  // When the user updates the `value` prop, update the state to reflect it.
  // Yea, it's a bit of an anti pattern, but it's we want in this case.
  // More info: https://stackoverflow.com/questions/32414308/updating-state-on-props-change-in-react-form
  componentWillReceiveProps(nextProps) {
    const newComponentView = this.calculateViewGivenProps.call(this, nextProps);

    // Update if state changed.
    if (newComponentView !== this.state.state) {
      this.setState({view: newComponentView});
    }
  }
  calculateViewGivenProps(props) {
    if (props.value) {
      return UPLOADED;
    } else if (props.value === null) {
      return NO_FILES;
    } else {
      return this.state.view;
    }
  }

  fileUploaded(files) {
    if (files.length === 1) {
      // One file was uploaded.
      const file = files[0];

      this.setState({view: UPLOADED});
      return this.props.onChange(file);
    } else if (files.length === 0) {
      // No file was uploaded.
      this.setState({view: NO_FILES});
      return this.props.onChange(null);
    } else {
      // Multiple files were uploaded. This picker only supports one file.
      this.setState({view: MULTIPLE_FILES});
      return this.props.onMultipleFileUpload();
    }
  }

  render() {
    return <div className={styles.accountSetupDoorwayDetailImageUploadContainer}>
      <div className={styles.accountSetupDoorwayDetailImageUploadHeader}>
        <span className={styles.accountSetupDoorwayDetailImageUploadHeaderLabel}>{this.props.label}</span>
        {this.state.view === UPLOADED ? <span
          className={styles.accountSetupDoorwayDetailImageUploadHeaderEdit}
          onClick={() => this.fileinput.click()}
        >Edit</span> : null}
      </div>
      <div
        className={styles.accountSetupDoorwayDetailImageUpload}
        style={{
          borderWidth: this.state.view === UPLOADED ? 0 : 2,
          height: this.state.view === UPLOADED ? 196 : 192
        }}
        onClick={() => this.fileinput.click()}
      >
        {/* This input[type=file] is hidden. It's "clicked" when its parent is clicked. */}
        <input
          type="file"
          className={styles.accountSetupDoorwayDetailFormElement}
          ref={ref => { this.fileinput = ref; }}
          onChange={() => this.fileUploaded.call(this, this.fileinput.files)}
        />

        {/* Render empty state of image picker */}
        {
          this.state.view !== UPLOADED ?
          <span className={`${styles.accountSetupDoorwayDetailImageUploadIcon} empty`}>&#xe942;</span> :
          null
        }
        {
          this.state.view !== UPLOADED ?
          <span className={styles.accountSetupDoorwayDetailImageUploadLink}>Take a picture or upload file</span> :
          null
        }

        {/* Render full state of image picker */}
        {this.state.view === UPLOADED ? <img
          className={styles.accountSetupDoorwayDetailImageUploadPreview}
          src={this.props.value}
          alt=""
        /> : null}
      </div>
    </div>;
  }
}
