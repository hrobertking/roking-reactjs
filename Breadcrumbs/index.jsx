/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Breadcrumbs
 * @requires react
 * @requires prop-types
 *
 * @description Renders a group inside a container with the 'breadcrumbs' class.
 *
 * @param {number} index - the index of the active item.
 *
 * @example
 * <Breadcrumbs aria-label="Breadcrumbs" id="trail" index={2}>
 *   <a href="/">Home</a>
 *   <a href="/libraries/">Libraries</a>
 *   <a href="/libraries/js/">JavaScript</a>
 * </Breadcrumbs>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';

class Breadcrumbs extends Component {
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

    const className = `${props.className || ''} breadcrumbs`.trim();

    return (
      <nav { ...props } className={className}>
        <ol>
          {this.steps}
        </ol>
      </nav>
    );
  }
}
Breadcrumbs.propTypes = {
  index: PropTypes.number,
};
export default Breadcrumbs;
