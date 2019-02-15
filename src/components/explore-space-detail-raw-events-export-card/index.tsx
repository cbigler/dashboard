import React from 'react';
import classnames from 'classnames';

import { core } from '../../client';

import {
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  CardTable,
  Icons,
  InfoPopup,
} from '@density/ui';

import mixpanelTrack from '../../helpers/mixpanel-track/index';
import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';

export const LOADING_INITIAL = 'LOADING_INITIAL',
      LOADING_PREVIEW = 'LOADING_PREVIEW',
      LOADING_CSV = 'LOADING_CSV',
      EMPTY = 'EMPTY',
      VISIBLE = 'VISIBLE',
      ERROR = 'ERROR';

export default class VisualizationSpaceDetailRawEventsExportCard extends React.Component<any, any> {
  state = {
    view: LOADING_INITIAL,
    headers: null,

    data: [],
    error: '',

    dataSpaceId: null,
    startDate: null,
    endDate: null,
  }
  dataFetchingInProgress = false

  fetchData = async () => {
    const { space } = this.props;
    const { view, startDate, endDate } = this.state;

    if (view === LOADING_PREVIEW) { return; }
    this.setState({view: LOADING_PREVIEW});

    try {
      const previewData = await core.spaces.csvPreview({
        base: core.config().core.replace('v2', 'v1'),
        space_id: space.id,
        start_time: startDate,
        end_time: endDate,
        page: 1,
        page_size: 5, /* only fetching a preview of what data could look like */
        order: 'desc',
      });

      // No results returned? Transition to EMPTY state.
      if (previewData.length === 0) {
        this.setState({
          view: EMPTY,
          dataSpaceId: space.id,

          data: null,
        });
        return;
      }

      const parsedPreviewData = previewData.split('\n').map(row => row.split(','));
      const previewDataHeaders = parsedPreviewData[0];
      const previewDataBody = parsedPreviewData.slice(1);

      // Update the state to reflect that the data fetching is complete.
      this.setState({
        view: VISIBLE,
        headers: previewDataHeaders,
        data: previewDataBody,
        dataSpaceId: space.id,
      });
    } catch (error) {
      this.setState({
        view: ERROR,
        error,
        data: null,
      });
    }
  }

  downloadCSV = async () => {
    const { space } = this.props;
    const { view, startDate, endDate } = this.state;

    mixpanelTrack('Data Download', {
      space_id: space.id,
      start_time: startDate,
      end_time: endDate,
    });

    if (view === LOADING_CSV) { return; }
    this.setState({view: LOADING_CSV});

    try {
      const csv = await core.spaces.csv({
        base: core.config().core.replace('v2', 'v1'),
        space_id: space.id,
        start_time: startDate,
        end_time: endDate,
        page: 1,
        page_size: 5, /* only fetching a preview of what data could look like */
        order: 'desc',
      });

      // This is a workaround to allow a user to download this csv data, or if that doesn't work,
      // then at least open it in a new tab for them to view and copy to the clipboard.
      // 1. Create a new blob url.
      // 2. Redirect the user to it in a new tab.
      const data = new Blob([csv], {type: 'text/csv'});
      const csvURL = URL.createObjectURL(data);

      // Hide the download spinner once csv has been downloaded and blob url has been created.
      this.setState({view: VISIBLE});

      const tempLink = document.createElement('a');
      document.body.appendChild(tempLink);
      tempLink.href = csvURL;
      tempLink.setAttribute('download', `${space.id}: ${startDate} - ${endDate}.csv`);
      tempLink.click();
      document.body.removeChild(tempLink);
    } catch (error) {
      this.setState({
        view: ERROR,
        error,
        data: null,
      });
    }
  }

  componentWillReceiveProps({space, startDate, endDate}) {
    if (space && (
      space.id !== this.state.dataSpaceId ||
      startDate !== this.state.startDate ||
      endDate !== this.state.endDate
    )) {
      this.setState({
        dataSpaceId: space.id,
        startDate,
        endDate,
      }, () => this.fetchData());
    }
  }

  render() {
    const {
      view,
      headers,
      data,
      error,
      startDate,
      endDate,
    } = this.state;
    const { space } = this.props;

    return <div>
      <Card className="explore-space-detail-raw-events-export-card">
        {view === LOADING_INITIAL || view === LOADING_PREVIEW || view === LOADING_CSV ? <CardLoading indeterminate /> : null}
        <CardHeader>
          CSV Event Export
          <InfoPopup horizontalIconOffset={8}>
            <p className="explore-space-detail-raw-events-export-card-description">
              Download all events from <strong>{parseISOTimeAtSpace(startDate, space).format('MMMM D, YYYY')}</strong> to{' '}
              <strong>{parseISOTimeAtSpace(endDate, space).format('MMMM D, YYYY')}</strong> in CSV format.
              The preview below shows a portion of the data which will be exported.
            </p>
          </InfoPopup>
          <span
            className={classnames('explore-space-detail-raw-events-export-card-header-refresh', {
              disabled: view !== VISIBLE,
            })}
            onClick={() => this.setState({
              view: LOADING_INITIAL,
              data: null,
            }, () => this.fetchData())}
          >
            <Icons.Refresh color={view === LOADING_PREVIEW ? 'gray' : 'primary'} />
          </span>
        </CardHeader>

        <CardBody className="explore-space-detail-raw-events-export-card-sample-rows">
          <strong>Sample rows</strong>
        </CardBody>

        {view === VISIBLE || view === LOADING_CSV ? <CardTable
          headings={headers}
          data={data.map((contents, index) => ({contents, id: contents[0]}))}
          mapDataItemToRow={n => n.contents}
        /> : null}

        {view === EMPTY ? <div className="explore-space-detail-raw-events-export-card-body-info">
          No data available for this time period.
        </div> : null}
        {view === LOADING_PREVIEW || view === LOADING_INITIAL ? <div className="explore-space-detail-raw-events-export-card-body-info">
          Fetching data preview ...
        </div> : null}
        {view === ERROR ? <div className="explore-space-detail-raw-events-export-card-body-error">
          <span>
            <span className="explore-space-detail-raw-events-export-card-body-error-icon">&#xe91a;</span>
            {error.toString()}
          </span>
        </div> : null}

        <div
          className={classnames('explore-space-detail-raw-events-export-card-download-bar', {
            disabled: view !== VISIBLE,
            loading: view === LOADING_CSV,
          })}
          role="button"
          onClick={() => view !== LOADING_CSV && this.downloadCSV()}
        >
          { view === LOADING_CSV || view === LOADING_INITIAL ? (
            <span>Generating CSV ...</span>
          ) : (
            <span>
              Download All Events{' '}
              ({parseISOTimeAtSpace(startDate, space).format('MM/DD/YYYY')} - {parseISOTimeAtSpace(endDate, space).format('MM/DD/YYYY')})
            </span>
          )}
        </div>
      </Card>
    </div>;
  }
}
