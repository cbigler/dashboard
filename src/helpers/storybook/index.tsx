import React, { useState } from 'react';
import { ObjectInspector } from 'react-inspector';


export const State: React.FunctionComponent<{
  initialState: any,
  render: (state: any, setState: React.Dispatch<any>) => JSX.Element
}> = ({ initialState, render }) => {
  const [state, setState] = useState(initialState);
  return render(state, setState);
}

export const JSONView: React.FunctionComponent<{
  json: string
}> = ({ json }) => {
  return (
    <div style={{marginTop: 12}}>
      <ObjectInspector data={json} />
    </div>
  )
}

type Renderer<T, R extends JSX.Element = JSX.Element> = (state: T, setState: (nextState: T) => void) => R 

export function withState<T extends any = any> (initialState: T, renderer: Renderer<T>) {
  return () => (
    <State
      initialState={initialState}
      render={(state, setState) => (
        renderer(state, setState)
      )}
    />
  )
}