/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class ProgressBar
 * @requires react
 * @requires prop-types
 *
 * @description Renders a group inside a container with the 'progressbar' class.
 *
 * @param {number} index - the index of the active item as an offset from the end.
 *
 * @example
 * <ProgressBar max={10} min={0} value={3}>
 *   30 percent complete
 * </ProgressBar>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProgressBar extends Component {
  render() {
    const {
      children,
      max,
      min,
      value,
    } = this.props;

    const range = max - min;
    const percent = Math.min(Math.floor(Math.abs(range ? value / range : 0)), 100);

    return (
      <div className="progressbar">
        <div
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={value}
          className="progressbar value"
          role="progressbar"
          style={{
            width: `${percent}%`,
          }}
        >{children}</div>
      </div>
    );
  }
}
ProgressBar.defaultValues = {
  max: 0,
  min: 0,
  value: 0,
};
ProgressBar.propTypes = {
  index: PropTypes.number,
};
export default ProgressBar;
