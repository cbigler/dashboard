import { DensityReport } from "../../types";

// Convert a camelCase string to snake_case
export function camelToSnake(input) {
  return input.replace(/[A-Z]/g, x => `_${x.toLowerCase()}`);
}

// Accept an object with camelCase keys and return an object with snake_case keys
export function objectCamelToSnake<T = any>(input): T {
  const output: any = {};

  for (const key in input) {
    if (Array.isArray(input[key])) {
      // If the value is an array, convert keys deeply.
      output[camelToSnake(key)] = input[key].map(i => objectCamelToSnake<any>({temp: i}).temp);
    } else if (input[key] && input[key].toString() === '[object Object]') {
      // If the value is an object, convert keys deeply.
      output[camelToSnake(key)] = objectCamelToSnake<any>(input[key]);
    } else if (typeof key === 'string') {
      output[camelToSnake(key)] = input[key];
    } else {
      output[key] = input[key];
    }
  }

  return (output as T);
}

// Sanitize a report by converting its settings to snake_case
export function sanitizeReportSettings(report: DensityReport) {
  return {
    ...report,
    settings: objectCamelToSnake(report.settings)
  };
}
