/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Tooltip
 * @description A tooltip is a popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it. It typically appears after a small delay and disappears when Escape is pressed or on mouse out.
 *
 * @param {string} [bind] - The ID of an element to bind an event handler to. The tooltip will be displayed when the event type, specified in the `trigger` prop is fired on the element with the specified ID.
 * @param {string} [id]
 * @param {string} [label] - The label for the open button. Either `label` or `bind` must be provided.
 * @param {string} [trigger] - The event type used to open the tooltip.
 *
 * @example
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import './style.css';

class Tooltip extends Component {
  constructor(props) {
    super(props);

    if (props.label) {
      this.element = `${props.id}-toggletip-controller`;
      this.trigger = 'click';
    } else {
      this.element = props.bind;
      this.trigger = (props.trigger || 'focus').toLowerCase();
    }

    const expanded = props.expanded;

    this.state = { expanded };
  }

  componentDidMount() {
    this.element = (typeof this.element === 'string') ?
      document.getElementById(this.element) :
      this.element;

    if (this.element) {
      if (this.props.label) { /* this is a toggle tip */
        this.element.addEventListener(this.trigger, this.toggle);
      } else {
        /* update aria */
        const repl = new RegExp(`\\s*${this.props.id}\\s*`, 'g');
        let ariaDescribedBy = this.element.getAttribute('aria-describedby');
        ariaDescribedBy = `${ariaDescribedBy.replace(repl, '')} ${this.props.id}`.trim();
        this.element.setAttribute('aria-describedby', ariaDescribedBy);

        this.element.addEventListener(this.trigger, this.open);
      }

      switch (this.trigger) {
        case 'focus':
          this.element.addEventListener('blur', this.close);
          break;
        case 'focusin':
          this.element.addEventListener('focusout', this.close);
          break;
        default:
      }
    }
  }

  render() {
    const {
      expanded,
    } = this.state;

    const {
      children,
      id,
      label,
      trigger,
      ...rest,
    } = this.props;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.close();
      }
    };

    /* add or remove Escape event */
    if (expanded) {
      document.addEventListener('keydown', onKeyDown);
    } else {
      document.removeEventListener('keydown', onKeyDown);
    }

    if (label) {
      return (
        <span className='tooltip'>
          <button
            aria-label={label}
            id={`${id}-toggletip-controller`}
            type='button'
            { ...rest }
          >i</button>
          <span aria-expanded={!!expanded} role='status'>
            <span className='container'>
              { expanded ? children : '' }
            </span>
          </span>
        </span>
      );
    }

    return (
      <span className='tooltip'>
        <span aria-expanded={!!expanded} id={id} role='tooltip'>
          <span className='container'>
            { children }
          </span>
        </span>
      </span>
    );
  }

  close = () => {
    this.setState({ expanded: false });
  };

  open = () => {
    this.setState({ expanded: true });
  };

  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  };
}
Tooltip.defaultProps = {
  id: `tooltip_${(new Date()).getTime()}`,
};
Tooltip.propTypes = {
  bind: PropTypes.string,
  label: PropTypes.string,
  trigger: PropTypes.string,
};
export default Tooltip;
