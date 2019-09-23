import React, { useState } from 'react';
import styles from './styles.module.scss';

import { DensityUser } from '../../types';
import { AnalyticsReport } from '../../types/analytics';
import { PartialAnalyticsReportWithQuery } from '../../rx-actions/analytics/open-partial-report';

// FIXME: The below should be switched to use the new rx-actinos based modal interface,
// point this out in a review!
import showModal from '../../actions/modal/show';

import AnalyticsPopup, { AnalyticsPopupPinCorner, ItemList } from '../analytics-popup';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import {
  Button,
  Icons,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  Skeleton,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import mixpanelTrack from '../../helpers/mixpanel-track';

import analyticsIntroImage from '../../assets/images/analytics-intro.svg';

enum MoreButtonChoices {
  RENAME = 'RENAME',
  DELETE = 'DELETE',
}

type MoreButtonProps = {
  reportName: string,
  onUpdateReportName: (string) => void,
  onDeleteReport: () => void,
};
function MoreButton({reportName, onUpdateReportName, onDeleteReport}: MoreButtonProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const dispatch = useRxDispatch();

  return (
    <AnalyticsPopup
      target={<Icons.More />}
      open={moreOpen}
      onOpen={() => setMoreOpen(true)}
      onClose={() => setMoreOpen(false)}
      pinCorner={AnalyticsPopupPinCorner.RIGHT}
    >
      <ItemList
        choices={[
          { id: MoreButtonChoices.RENAME, label: 'Rename' },
          { id: MoreButtonChoices.DELETE, label: 'Delete' },
        ] as Array<{id: MoreButtonChoices, label: string}>}
        onClick={choice => {
          setMoreOpen(false);
          switch (choice.id) {
          case MoreButtonChoices.RENAME:
            mixpanelTrack('Analytics Report Rename', {
              'Location': 'Home',
            });
            // FIXME: The below should be switched to use the new rx-actinos based modal interface,
            // point this out in a review!
            showModal('MODAL_PROMPT', {
              title: `Rename '${reportName}'`,
              placeholder: 'Enter a new name',
              confirmText: 'Save',
              callback: onUpdateReportName,
            })(dispatch);
            break;
          case MoreButtonChoices.DELETE:
            mixpanelTrack('Analytics Report Delete', {
              'Location': 'Home',
            });
            // FIXME: The below should be switched to use the new rx-actinos based modal interface,
            // point this out in a review!
            showModal('MODAL_CONFIRM', {
              title: `Delete Report`,
              prompt: `Are you sure you want to delete ${reportName}?`,
              confirmText: 'Delete',
              callback: onDeleteReport,
            })(dispatch);
            break;
          }
        }}
      />
    </AnalyticsPopup>
  );
}

type AnalyticsHomePageProps = {
  user: DensityUser,
  introVisible: boolean,
  reports: Array<AnalyticsReport>,
  recommendedReports: Array<Partial<AnalyticsReport>>,

  onChangeIntroVisible: (visible: boolean) => void,
  onCreateReport: () => void,
  onOpenPartialReport: (partialReport: PartialAnalyticsReportWithQuery) => void,
  onOpenReport: (report: AnalyticsReport) => void,
  onUpdateReportName: (report: AnalyticsReport, name: string) => void,
  onDeleteReport: (report: AnalyticsReport) => void,
};

export default function AnalyticsHomePage({
  user,
  introVisible,
  reports,
  recommendedReports,

  onChangeIntroVisible,
  onCreateReport,
  onOpenPartialReport,
  onOpenReport,
  onUpdateReportName,
  onDeleteReport,
}: AnalyticsHomePageProps) {
  const savedReports = reports.filter(r => (
    r.type === 'LINE_CHART' &&
    r.isSaved &&
    r.creatorEmail === user.email
  )).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className={styles.home}>
      <div className={styles.homeMain}>
        {introVisible ? (
          <div className={styles.analyticsIntro}>
            <div className={styles.analyticsIntroLeft}>
              <h1>Analytics<sup>BETA</sup></h1>
              <p>A new way to explore your Density data and gain deeper insights into your portfolio.</p>
            </div>
            <div className={styles.analyticsIntroRight}>
              <Button onClick={() => onChangeIntroVisible(false)} variant="underline" type="muted">
                <div className={styles.dismissButton}>
                  <Icons.VisibilityHide />
                  <span className={styles.dismissButtonText}>Dismiss</span>
                </div>
              </Button>
            </div>
            <img alt="" className={styles.analyticsIntroImage} src={analyticsIntroImage} />
          </div>
        ) : null}

        <SavedReportsListView
          savedReports={savedReports}
          onOpenReport={onOpenReport}
          onUpdateReportName={onUpdateReportName}
          onDeleteReport={onDeleteReport}
        />

        {savedReports.length === 0 ? (
          <div className={styles.homeSavedReportsEmpty}>
            <p>You haven't created any reports yet. Create a new report to get started.</p>
            <Button onClick={() => {
              mixpanelTrack('Analytics: Create Report', {
                'Location': 'Empty State'
              });
              onCreateReport();
            }}>Create a Report</Button>
          </div>
        ) : null}
      </div>
      <div className={styles.homeRecommended}>
        <RecommendedListView
          recommendedReports={recommendedReports}
          onOpenPartialReport={onOpenPartialReport}
        />

        {recommendedReports.length === 0 ? (
          <div className={styles.homeRecommendedReportsEmpty}>
            <h3>We don't have any report recommendations</h3>
            <p>
              This is due to a lack of information about your spaces. Head over to your{' '}
              <a href="#/admin/locations">Locations</a> section of speak to your admin about
              completing your profile.
            </p>
          </div>
        ): null}
      </div>
    </div>
  );
}

function SavedReportsListView({
  savedReports,
  onOpenReport,
  onUpdateReportName,
  onDeleteReport,
}) {
  return (
    <ListView data={savedReports}>
      <ListViewColumn
        id="Saved Reports"
        title={<div className={styles.homeHeader}>
          <span className={styles.homeHeaderIcon}>
            <Icons.Save color={colorVariables.brandPrimary} />
          </span>
          Saved Reports
        </div>}
        template={report => report.name}
        onClick={report => {
          mixpanelTrack('Analytics Open Saved Report', { 'Location': 'Home' });
          onOpenReport(report);
        }}
      />
      <ListViewColumnSpacer />
      <ListViewColumn id=" " width={50} template={report => (
        <MoreButton
          reportName={report.name}
          onUpdateReportName={name => onUpdateReportName(report, name)}
          onDeleteReport={() => onDeleteReport(report)}
        />
      )} />
    </ListView>
  );
}

function RecommendedListView({recommendedReports, onOpenPartialReport}) {
  return (
    <ListView
      data={recommendedReports}
      onClickRow={report => onOpenPartialReport(report)}
    >
      <ListViewColumn
        id="Recommended"
        title={<div className={styles.homeHeader}>
          <span className={styles.homeHeaderIcon}><Icons.Lightning /></span>
          Recommended
        </div>}
        template={report => report.name}
      />
    </ListView>
  );
}

// FIXME: The way that this skeleton state works is not something I'm all that satisfied with. At
// the moment, I decided to use the same component for rendering the regular reports list as
// rendering the skeleton list, which has the benefit of ensuring the layout is the same. Point this
// out in a review, and maybe come up with a better (or at least a way that doesn't require putting
// dummy () => {} props for a lot of things)
export function AnalyticsHomeSkeleton() {
  return (
    <div className={styles.home}>
      <div className={styles.homeMain}>
        <SavedReportsListView
          savedReports={[
            {id: 1, name: <Skeleton width={100} height={6} color={colorVariables.gray} />},
            {id: 2, name: <Skeleton width={145} height={6} color={colorVariables.gray} />},
          ]}
          onOpenReport={() => {}}
          onUpdateReportName={() => {}}
          onDeleteReport={() => {}}
        />
      </div>
      <div className={styles.homeRecommended}>
        <RecommendedListView
          recommendedReports={[
            {id: 1, name: <Skeleton width={100} height={6} color={colorVariables.gray} />},
            {id: 2, name: <Skeleton width={145} height={6} color={colorVariables.gray} />},
          ]}
          onOpenPartialReport={() => {}}
        />
      </div>
    </div>
  );
}
