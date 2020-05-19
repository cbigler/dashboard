import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import colors from '@density/ui/variables/colors.json';

const useStyles = makeStyles(theme => ({
  tooltip: {
    color: colors.white,
    backgroundColor: colors.midnight,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
  },
  tooltipPlacementBottom: {
    marginTop: 8,
  },
}));

// Temporary component to make new info popup styles
// TODO: Backport this into density ui
export default function InfoPopupNew({
  target,
  contents,
  placement,
  enterDelay,
  wrap,
}: {
  target: React.ReactElement,
  contents: React.ReactNode,
  placement?: TooltipProps['placement'],
  enterDelay?: TooltipProps['enterDelay'],
  wrap?: boolean,
}) {
  const classes = useStyles();

  return <Tooltip
    classes={classes}
    title={contents || ''}
    placement={placement || 'bottom-start'}
    enterDelay={enterDelay || 700}
  >
    <div style={{whiteSpace: wrap ? undefined : 'nowrap'}}>{target}</div>
  </Tooltip>;
}
