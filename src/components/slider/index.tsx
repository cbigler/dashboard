import MaterialUISlider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';


const colorDark = '#0d183a';
const colorLight = '#c9ced7';

const trackHeight = 4;
const handleSize = 16;

const Slider = withStyles({
  root: {
    color: colorDark,
    height: trackHeight,
    marginTop: 24,
    marginBottom: 0,
    paddingTop: (trackHeight + handleSize) / 2,
    paddingBottom: (trackHeight + handleSize) /2,
    
    // glorious hackery (this basically pads 8px on either side without messing up layout)
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    
    width: '100%',
    boxSizing: 'border-box',
  },
  track: {
    height: trackHeight,
    borderRadius: 2,
    backgroundColor: colorDark,
  },
  trackInverted: {
    '& $rail': {
      backgroundColor: colorDark,
    },
    '& $track': {
      backgroundColor: colorLight,
    }
  },
  rail: {
    height: trackHeight,
    borderRadius: 2,
    backgroundColor: colorLight,
  },
  thumb: {
    width: handleSize,
    height: handleSize,
    marginLeft: -9,
    marginTop: -6.5,
  },
  mark: {
    opacity: 0,
  },
  markLabel: {
    top: -18,
    fontFamily: 'Aeonik, sans-serif',
    fontSize: 12,
    fontWeight: 'bold',
  }
})(MaterialUISlider);

export default Slider;