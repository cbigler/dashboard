import changeCase from 'change-case';

// Convert an object with snake case keys to camel case keys.
export default function objectSnakeToCamel<T = any>(input): T {
  const output: any = {};

  for (const key in input) {
    if (Array.isArray(input[key])) {
      // If the value is an array, convert keys deeply.
      output[changeCase.camel(key)] = input[key].map(i => objectSnakeToCamel<any>({temp: i}).temp);
    } else if (input[key] && input[key].toString() === '[object Object]') {
      // If the value is an object, convert keys deeply.
      output[changeCase.camel(key)] = objectSnakeToCamel<any>(input[key]);
    } else if (typeof key === 'string') {
      output[changeCase.camel(key)] = input[key];
    } else {
      output[key] = input[key];
    }
  }

  return (output as T);
}
