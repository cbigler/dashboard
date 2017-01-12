import React from 'react';
import {connect} from 'react-redux';
import c3 from 'c3';
import moment from 'moment';

let EventCountChart = React.createClass({

  drawChart: function(timestamps, counts) {
    let newTimestamps = ['Time'].concat(timestamps);
    let newCounts = ['Count'].concat(counts);
    this._chart = c3.generate({
      bindto: '#eventcountchart',
      tooltip: {
        show: true,
        format: {
          title: function (x) { return moment(x).format('h:mm:ss A'); }
        }
      },
      padding: {
        right: 20
      },
      grid: {
        y: {
          show: true
        }
      },
      line: {
        step: {
          type: 'step-after'
        }
      },
      data: {
        x: 'Time',
        y: 'Count',
        colors: {
          'Count': '#DDDDDD',
        },
        columns: [
          newTimestamps,
          newCounts,
        ],
        type: 'area-step',
        labels: false
      },
      legend: {
        show: false,
        hide: true
      },
      axis: {
        y: {
          show: true,
          tick: {
            outer: false
          }
        },
        x: {
          type: 'timeseries',
          label: {
            show: false
          },
          height: 50,
          tick: {
            fit: false,
            format: '%-I:%M %p',
            outer: false
          }
        }
      }
    });
  },

  updateChart: function(timestamps, counts) {
    let newTimestamps = ['Time'].concat(timestamps);
    let newCounts = ['Count'].concat(counts);
    this._chart.load({
      columns: [newTimestamps, newCounts]
    });
  },
  
  componentDidMount: function() {
    this.drawChart(this.props.timestamps, this.props.counts);
  },

  componentDidUpdate: function () {
    this.updateChart(this.props.timestamps, this.props.counts);
  },

  render: function() {
    return (
      <div id="eventcountchart"></div>
    );
  }
});

module.exports = EventCountChart;