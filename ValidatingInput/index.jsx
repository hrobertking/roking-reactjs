/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class ValidatingInput
 *
 * @description An input that tracks which rules have been met and updates the list to show the class has been used.
 *
 * @example
 * <ValidatingInput
 *   id="mypassword"
 *   rules={{
 *     '/[a-z]/i': 'A letter is required',
 *     '/\\d/': 'A number is required',
 *     '/[!@#$%^&*]/': 'One of the special characters, {match}, is required',
 *     '/abc/': '{match} is required',
 *     '/^.{8,16}$/': 'Your password must be between 8 and 16 characters long',
 *   }}
 *   type="password"
 * />
 *
 * <ValidatingInput
 *   id="mytext"
 *   rules={{
 *     '/[A-Z]/': 'An uppercase letter is required',
 *     '/[a-z]/': 'A lowercase letter is required',
 *     '/\\d/': 'A number is required',
 *     '/[!@#$%^&*]/': 'One of the special characters, {match}, is required',
 *     '/abc/': '{match} is required',
 *   }}
 *   type="text"
 * />
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

class ValidatingInputDescription extends Component {
  constructor(props) {
    super(props);

    const {
      id,
      rules,
      value,
    } = props;

    if (rules) {
      this.children = Object.keys(rules)
        .map((key, i) => (
          <ValidatingInputRule
            id={`${id}-rule-${i}`}
            message={rules[key]}
            rule={key}
          />
        ));
    }

    this.id = `${id}-description`;

    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(props) {
    const {
      value,
    } = props;

    this.setState({ value });
  }

  render() {
    if (!this.children) {
      return null;
    }

    return (
      <ul
        className="character-class-description"
        id={this.id}
        style={{
          listStyleType: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {this.children.map(child => React.cloneElement(child, { value: this.state.value }))}
      </ul>
    );
  }
}
class ValidatingInputRule extends Component {
  constructor(props) {
    super(props);

    const {
      rule,
    } = props;

    const fr = /\/(\w*)$/;
    const flags = fr.exec(rule)[1];
    const chars = rule.replace(fr, '')
      .replace(/^\//, '')
      .replace(/\[([^\x5D]*)\]/g, (input, match) => {
        return match.replace(/([a-z0-9])-([a-z0-9])/g, (whole, p1, p2) => {
          const sr = Math.min(p1.charCodeAt(0), p2.charCodeAt(0));
          const sp = Math.max(p1.charCodeAt(0), p2.charCodeAt(0));
          let s = '';
          for (let c = sr; c <= sp; c += 1) {
            s = `${s}${String.fromCharCode(c)}`;
          }
          return s;
        }).split('').join(', ');
      })
      .split('|').join(', ');

    // Sample test
    // props.rule ='/abc|def/i',
    // props.message = 'One of: {match} is required'
    // source = new RegExp('abc|def', 'i')
    // message='One of: abc, def is required'

    this.content = props.message.replace(/\{match\}/, chars);
    this.source = new RegExp(rule.replace(/^\//, '').replace(fr, ''), flags);

    this.state = {
      valid: this.source.test(props.value),
    };
  }

  componentWillReceiveProps(props) {
    const valid = this.source.test(props.value);
    const previous = this.state.valid;
    const updated = valid !== previous;
    this.setState({ valid, updated });
  }

  render() {
    return (
      <li
        id={this.props.id}
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'flex-end',
        }}
      >
        <span
          id={`${this.props.id}-rule`}
          style={{
            display: 'inline-block',
            margin: '0 0.125rem',
          }}
        >
          {this.content}
        </span>
        <span
          aria-label={this.state.valid ? '≻' : '⊁'}
          style={{
            display: 'inline-block',
            margin: '0 0.125rem',
            width: '1rem',
          }}
        >
          {
            this.state.valid ? '✓' : '⚠'
          }
        </span>
      </li>
    );
  }
}
class ValidatingInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
    };
  }

  render() {
    const {
      className,
      rules,
      ...attrs,
    } = this.props;
    const css = `${className} character-class'`.trim();

    return (
      <React.Fragment>
      <input
        { ...attrs }
        aria-describedby={`${this.props.id}-description`}
        className={css}
        onChange={this.onChange}
      />
      <ValidatingInputDescription id={this.props.id} rules={this.props.rules} value={this.state.value} /> 
      </React.Fragment>
    );
  }

  /**
   * @private
   * @description Change handler
   * @returns {undefined}
   * @param {event} e
   */
  onChange = (e) => {
    const {
      value,
    } = e.target;
    this.setState({ value });
  }
}
ValidatingInput.defaultProps = {
  className: '',
  id: `characterclass-${(new Date()).getTime()}`
};
ValidatingInput.propTypes = {
};
export default ValidatingInput;
