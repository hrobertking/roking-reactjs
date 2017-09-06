/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Controller
 * @requires react
 * @requires prop-types
 *
 * @description A controller (button) that finds the specified component and executes the method or
 * returns the property specified. Caveat: the HTMLElement for the component must exist in the DOM.
 *
 * @param {string} controls
 * @param {string} label
 * @param {string} member
 * @param {function} [onClick] - An ECMAScript function to execute prior to access the member of the
 * controlled item.
 *
 * @example
 * <Controller controls="tour" label="Show the new features list" member="open" />
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

class Controller extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * @property attributes
   * @description HTML attributes
   * @type {object}
   */
  get attributes() {
    const passthru = { ...this.props };

    /* delete _our_ props */
    delete passthru.controls;
    delete passthru.label;
    delete passthru.member;
    delete passthru.onClick;

    return passthru;
  }

  /**
   * @property controlled
   * @description The React.Component controlled by the Controller
   * @type {React.component}
   */
  get controlled() {
    const node = document.getElementById(this.props.controls);
    if (node) {
      const keys = Object.keys(node);
      let idx = keys.length - 1;
      while (idx > -1) {
        const key = keys[idx];
        if (key.startsWith("__reactInternalInstance$")) {
          return node[key]._debugOwner.stateNode;
        }
        idx -= 1;
      }
    }
  }

  /**
   * @private
   * @description Executes the method on the controlled component or returns the
   * specified property. Executes the function passed in `onClick` (if any) prior
   * to returning.
   * @returns {*}
   * @param {event} evt
   */
  onClick = (evt) => {
    const node = this.controlled;
    const member = node ? node[this.props.member] : null;
    if (member) {
      if (this.props.onClick) {
        evt.relatedTarget = document.getElementById(this.props.controls);
        this.props.onClick(evt);
      }
      if (typeof member === 'function') {
        return member.call(node, evt);
      }
      return member;
    }
  }

  render() {
    const {
      label,
    } = this.props;

    return (
      <button {...this.attributes} onClick={this.onClick}>{label}</button>
    );
  }
}
Controller.propTypes = {
  controls: PropTypes.string.isRequired,
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  member: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};
export default Controller;
