// Helper to read a backend (axios) error message/detail from wherever it may be found

export default function getBackendErrorDetail(error) {
  if (typeof error.response.data === 'string') {
    return error.response.data;
  } else if (error.response.data.length > 0) {
    return error.response.data[0];
  } else if (typeof error.response.data === 'object') {
    return error.response.data.detail;
  }
}
