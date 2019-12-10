import React from 'react';

export const AnalyticsFeatureFlagsContext = React.createContext<{
  opportunityMetricEnabled: boolean
}>({
  opportunityMetricEnabled: false
});