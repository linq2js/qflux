import React from "react";

const Context = React.createContext();
const defaultMapper = (state, actions, ownedProps) => ownedProps;

function createHoc(mapStateToProps = defaultMapper) {
  return function(component) {
    return function(props) {
      return React.createElement(Context.Consumer, {}, function(context) {
        const mappedProps = mapStateToProps(
          context.state,
          context.actions,
          props
        );

        return React.createElement(CustomizedConsumer, {
          __component: component,
          ...mappedProps
        });
      });
    };
  };
}

function createStore(initialState = {}, actions = {}, handler = {}, onChange) {
  const wiredActions = {};
  let current = {
    state: initialState,
    actions: wiredActions
  };

  handler.get = () => current.state;
  handler.wired = true;

  // wire all actions
  Object.entries(actions).forEach(([name, action]) => {
    wiredActions[name] = handler[name] = function() {
      let result = action.apply(null, arguments);
      if (typeof result === "function") {
        const nextState = result(current.state, current.actions);
        if (nextState && typeof nextState.then === "function") {
          nextState.then(set);
        } else {
          set(nextState);
        }

        return nextState;
      }
    };
  });

  function set(nextState) {
    if (nextState !== current.state) {
      let changed = false;
      // perform shallow compare to detect change between current state and next state
      for (let key in nextState) {
        if (nextState[key] !== current.state[key]) {
          changed = true;
          if (current.state === nextState) {
            current = {
              state: nextState,
              actions: wiredActions
            };
          }
          current.state[key] = nextState[key];
        }
      }
      // notify change
      if (changed) {
        onChange(current.state);
      }
    }
    return nextState;
  }

  return {
    current() {
      return current;
    }
  };
}

class CustomizedConsumer extends React.PureComponent {
  render() {
    const { __component, ...props } = this.props;
    return React.createElement(__component, props);
  }
}

class CustomizedProvider extends React.PureComponent {
  handleChange() {
    !this.unmount && this.forceUpdate();
  }

  componentWillUnmount() {
    this.unmount = true;
  }

  render() {
    const { state, actions, handler, children } = this.props;
    if (this.prevProps !== this.props) {
      this.store = undefined;
    }

    if (!this.store) {
      this.store = createStore(
        state,
        actions,
        handler,
        () => this.handleChange
      );
    }

    return React.createElement(Context.Provider, {
      value: this.store.current(),
      children
    });
  }
}

function renderProvider(props) {
  return React.createElement(CustomizedProvider, props);
}

export default function() {
  // map state to props
  if (typeof arguments[0] === "function") {
    const hoc = createHoc(arguments[0]);
    if (arguments.length > 1) {
      return hoc(arguments[1]);
    }
    return hoc;
  }
  return renderProvider(arguments[0]);
}
