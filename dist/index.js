"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
  // map state to props
  if (typeof arguments[0] === "function") {
    var hoc = createHoc(arguments[0]);
    if (arguments.length > 1) {
      return hoc(arguments[1]);
    }
    return hoc;
  }
  return renderProvider(arguments[0]);
};

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Context = _react2.default.createContext();
var defaultMapper = function defaultMapper(state, actions, ownedProps) {
  return ownedProps;
};

function createHoc() {
  var mapStateToProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMapper;

  return function (component) {
    return function (props) {
      return _react2.default.createElement(Context.Consumer, {}, function (context) {
        var mappedProps = mapStateToProps(context.state, context.actions, props);

        return _react2.default.createElement(CustomizedConsumer, _extends({
          __component: component
        }, mappedProps));
      });
    };
  };
}

function createStore() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var onChange = arguments[3];

  var wiredActions = {};
  var _current = {
    state: initialState,
    actions: wiredActions
  };

  handler.get = function () {
    return _current.state;
  };
  handler.wired = true;

  // wire all actions
  Object.entries(actions).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        name = _ref2[0],
        action = _ref2[1];

    wiredActions[name] = handler[name] = function () {
      var result = action.apply(null, arguments);
      if (typeof result === "function") {
        var nextState = result(_current.state, _current.actions);
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
    if (nextState !== _current.state) {
      var changed = false;
      // perform shallow compare to detect change between current state and next state
      for (var key in nextState) {
        if (nextState[key] !== _current.state[key]) {
          changed = true;
          if (_current.state === nextState) {
            _current = {
              state: nextState,
              actions: wiredActions
            };
          }
          _current.state[key] = nextState[key];
        }
      }
      // notify change
      if (changed) {
        onChange(_current.state);
      }
    }
    return nextState;
  }

  return {
    current: function current() {
      return _current;
    }
  };
}

var CustomizedConsumer = function (_React$PureComponent) {
  _inherits(CustomizedConsumer, _React$PureComponent);

  function CustomizedConsumer() {
    _classCallCheck(this, CustomizedConsumer);

    return _possibleConstructorReturn(this, (CustomizedConsumer.__proto__ || Object.getPrototypeOf(CustomizedConsumer)).apply(this, arguments));
  }

  _createClass(CustomizedConsumer, [{
    key: "render",
    value: function render() {
      var _props = this.props,
          __component = _props.__component,
          props = _objectWithoutProperties(_props, ["__component"]);

      return _react2.default.createElement(__component, props);
    }
  }]);

  return CustomizedConsumer;
}(_react2.default.PureComponent);

var CustomizedProvider = function (_React$PureComponent2) {
  _inherits(CustomizedProvider, _React$PureComponent2);

  function CustomizedProvider() {
    _classCallCheck(this, CustomizedProvider);

    return _possibleConstructorReturn(this, (CustomizedProvider.__proto__ || Object.getPrototypeOf(CustomizedProvider)).apply(this, arguments));
  }

  _createClass(CustomizedProvider, [{
    key: "handleChange",
    value: function handleChange() {
      !this.unmount && this.forceUpdate();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.unmount = true;
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _props2 = this.props,
          state = _props2.state,
          actions = _props2.actions,
          handler = _props2.handler,
          children = _props2.children;

      if (this.prevProps !== this.props) {
        this.store = undefined;
      }

      if (!this.store) {
        this.store = createStore(state, actions, handler, function () {
          return _this3.handleChange;
        });
      }

      return _react2.default.createElement(Context.Provider, {
        value: this.store.current(),
        children: children
      });
    }
  }]);

  return CustomizedProvider;
}(_react2.default.PureComponent);

function renderProvider(props) {
  return _react2.default.createElement(CustomizedProvider, props);
}
//# sourceMappingURL=index.js.map