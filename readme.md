# qflux

A tiny Flux implement for React. If you feel tired with reducer, action creator, middleware so qflux is good choice for you.
It has only exposed function, can learn in 5 mins. qflux focuses on fast app development, not powerful or high performance.
Let's get started with counter app

```jsx harmony
import React from "react";
import { render } from "react-dom";
import Flux from "qflux";
// create initial state with counter = 0
const initialState = { counter: 0 };
// define some actions
const actions = {
  increase: () => state => ({ counter: state.counter + 1 }),
  decrease: () => state => ({ counter: state.counter - 1 })
};
const Counter = Flux(
  // map context to props
  state => ({ counter: state.counter }),
  // component rendering
  props => (
    <div>
      <h3>{props.counter}</h3>
      <button onClick={props.increase}>+</button>
      <button onClick={props.decrease}>-</button>
    </div>
  )
);
// put them to your app
function App() {
  return (
    <Flux state={initialState} actions={actions}>
      <div className="App">
        <CounterComp />
      </div>
    </Flux>
  );
}
render(<App />, document.getElementById("root"));
```

## References

There is only one exposed function, it has 3 overloads

### <Flux/> element

Render flux provider, the element has 3 props:

**state**: initial state for your app

**actions**: a collect of app action, these actions will be wired and you can invoke them at any descendants component

**handler**: for advanced usage, it helpful if you want to invoke action outside component level (ex: Server event).
For sample, use handler to increase counter every 1 second

```jsx harmony
const handler = {};
function App() {
  return <Flux state={initialState} actions={actions} handler={handler} />;
}
render(<App />, document.getElementById("root"));
// once Flux element rendered, it binds all actions to handler
setInterval(() => handler.increase(), 1000);
```

Beside, handler provides a method get() to access current app state.

### Flux(propMapper:Function): HOC

Create new HOC with specified propMapper. propMapper retrieves 3 arguments: state, actions, ownProps

The results of propMapper must be a plain object

### Flux(propMapper:Function, component): WrappedComponent

this one is equipped like Flux(propMapper)(component)

### Action

Action is simple and pure function, it can retrieve anything you want.
For updating state, just returns a function as state modifier. That modifier retrieves 2 arguments:

**state**: current app state

**actions**: app wired actions, you can invoke any action inside calling action

State modifier should return new state, qflux will perform shallow compare both states (current and new) and merge the changes

```jsx harmony
const withoutStateUpdatingAction = (arg1, arg2) => result;
const withStateUpdatingAction = (arg1, arg2) => state => ({
  // manual merging state not needed
  // ...state,
  counter: state.counter + 1
});
const asyncUpdate = () => state =>
  Api.loadArticles().then(res => ({
    articles: res
  }));
```