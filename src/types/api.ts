// GET /v2/spaces/counts
export type SpacesCountsAPIResponse = {
  total: number,
  next: string | null,
  previous: string | null,
  results: {
    [spaceId: string]: Array<{
      timestamp: string,
      count: number,
      interval: {
        start: string,
        end: string,
        analytics: {
          entrances: number
          entry_rate: number
          events: number
          exit_rate: number
          exits: number
          max: number
          min: number
          target_utilization: number | null
          utilization: number | null
        }
      }
    }>
  }
}

// GET /v2/spaces/counts/metrics
export type SpacesCountsMetricsAPIResponse = {
  [spaceId: string]: {
    metrics: {
      count: {
        average: number,
        max: {
          value: number,
          timestamp: string,
        },
        min: {
          value: number,
          timestamp: string,
        },
      },
      entrances: {
        average: number,
        peak: {
          value: number,
          timestamp: string,
        },
        total: number,
      },
      exits: {
        average: number,
        peak: {
          value: number,
          timestamp: string,
        },
        total: number,
      },
      target_utilization: {
        average: number,
        durations: {
          0: string,
          40: string,
          80: string,
          100: string,
        },
        max: {
          value: number,
          timestamp: string,
        },
        min: {
          value: number,
          timestamp: string,
        },
      },
    }
  }
};