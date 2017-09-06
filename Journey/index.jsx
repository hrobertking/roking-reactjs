/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Journey
 * @requires react
 * @requires prop-types
 *
 * @description Renders a group inside a container with the 'journey' class.
 *
 * @param {number} index - the index of the active item.
 *
 * @example
 * <Journey aria-label="Journey" id="trail" index={2}>
 *   <div>Billing Address</div>
 *   <div>Shipping Address</div>
 *   <div>Payment</div>
 * </Journey>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';

class Journey extends Component {
  constructor(props) {
    super(props);

    /* default the index to the last child */
    const index = Number(props.index) || 0;

    let step = 1;

    this.steps = React.Children.map(props.children, (child) => {
      const { props, type } = child;

      const ariaCurrent = (index === step) ? 'page' : null;

      step += 1;

      /* if this is a list item, return it, otherwise, return a list item */
      if (typeof type !== 'function' && type === 'li') {
        return React.cloneElement(child, {
          'aria-current': ariaCurrent,
          'data-index': step,
        });
      }

      return (
        <li
          aria-current={ariaCurrent}
          data-index={step}
        >
          {child}
        </li>
      );
    });
  }

  render() {
    const {
      props,
    } = this;

    const className = `${props.className || ''} journey`.trim();

    return (
      <ol { ...props } className={className}>
        {this.steps}
      </ol>
    );
  }
}
Journey.propTypes = {
  index: PropTypes.number,
};
export default Journey;
