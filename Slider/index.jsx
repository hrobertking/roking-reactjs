/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Slider
 *
 * @description An accessible slider.
 *
 * @param {string} id - the unique identifier for the slider
 * @param {string} label - the label tied to the input
 * @param {object} [markerStyle] - styles to apply to the marker
 * @param {string|number} max - the maximum value the slider can have
 * @param {string|number} min - the minimum value the slider can have
 * @param {function} [onChange] - an event handler for a change event for the input
 * @param {jsxInlineStyle} [fillStyle] - styles to apply to the fill
 * @param {jsxInlineStyle} [railStyle] - styles to apply to the background
 * @param {jsxInlineStyle} [sliderStyle] - styles to apply to the slider
 * @param {string|number} [step] - the number of units to increment/decrement on each update. default is 1
 * @param {string|number} [value] - the default value
 *
 * @example
 * <Slider id="rgbR" label="R" min={0} max={255} value={50} />
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import './style.css';

class Slider extends Component {
  constructor(props) {
    super(props);

    /**
     * @private
     * @description Convert a string to a number.
     * @returns {number}
     * @param {string} n
     */
    const toNum = (n) => {
      if (typeof n === 'string') {
        const comma = n.lastIndexOf(',');
        const dot = n.lastIndexOf('.');
        const sp = n.lastIndexOf(' ');
        const rightmost = Math.max(comma, dot, sp);
        const seps = /[\s,.]/g;
        const grps = n.split(seps).length;

        let normalized = n;

        /* if there is a group separator and a decimal separator */
        if ((comma > -1 && dot > -1) ||
            (comma > -1 && sp > -1) ||
            (dot > -1 && sp > -1)) {
          normalized = splitAt(n, rightmost);
          normalized.forEach((v, i, a) => {
            const ref = a;
            ref[i] = v.replace(seps, '');
          });
          normalized = normalized.join('.');
        /* if there are only group separators */
        } else if (grps > 2) {
          normalized = n.replace(seps, '');
          /* if there is only one separator, assume it's a decimal separator */
        } else if (grps === 2) {
          normalized = n.replace(seps, '.');
        }
        return Number(normalized);
      }
      return Number(n);
    };

    this.id = props.id || `slider_${(new Date()).getTime()}`;
    this.label = props.label || '';
    this.max = toNum(props.max) || 0;
    this.min = toNum(props.min) || 0;
    this.step = toNum(props.step) || 1;

    this.defaultValue = toNum(props.value) || this.min;

    this.shortcuts = {
      ArrowDown: () => this.value = Number(this.value) - this.step,
      ArrowLeft: () => this.value = Number(this.value) - this.step,
      ArrowRight: () => this.value = Number(this.value) + this.step,
      ArrowUp: () => this.value = Number(this.value) + this.step,
      End: () => this.value = this.max,
      Home: () => this.value = this.min,
      PageDown: () => this.value = Number(this.value) - (10 * this.step),
      PageUp: () => this.value = Number(this.value) + (10 * this.step),
    };
  }

  componentDidMount() {
    this.node = {
      input: document.getElementById(`${this.id}-input`),
      fill: document.getElementById(`${this.id}-fill`),
      rail: document.getElementById(`${this.id}-rail`),
      marker: document.getElementById(`${this.id}-marker`),
    };

    /* set the value _after_ the input node has been mounted */
    this.value = this.defaultValue;
    delete this.defaultValue;
  }

  render() {
    return (
      <div
        className='slider'
        id={this.id}
        style={{
          ...this.props.sliderStyle,
          display: 'flex',
        }}
      >
        <div
          className='rail'
          id={`${this.id}-rail`}
          data-max={this.max}
          data-min={this.min}
          data-value={this.value}
          onClick={this.onClick}
          style={{
            ...this.props.railStyle,
            alignItems: 'center',
            display: 'flex',
            width: '100%',
          }}
        >
          <input
            id={`${this.id}-input`}
            name={`${this.id}-input`}
            type='hidden'
          />
          <div
            className='channel'
            style={{
              border: '1px solid #ccc',
              ...this.props.fillStyle,
              display: 'block',
              left: '0.6rem',
              minHeight: '1rem',
              position: 'absolute',
              right: '0.6rem',
            }}
          >
            <div
              className='fill'
              id={`${this.id}-fill`}
              onClick={this.onClick}
              style={{
                backgroundColor: '1px solid #eee',
                ...this.props.fillStyle,
                minHeight: '1rem',
              }}
            />
          </div>
          <div
            aria-label={this.label}
            aria-valuemax={this.max}
            aria-valuemin={this.min}
            aria-valuenow={this.value}
            id={`${this.id}-marker`}
            onKeyDown={this.onKeyDown}
            onMouseDown={this.onMouseDown}
            role='slider'
            style={{
              minHeight: '3rem',
              ...this.props.markerStyle,
              display: 'inline-block',
              position: 'relative',
            }}
            tabindex='0'
          >
            &nbsp;
          </div>
        </div>
      </div>
    );
  }

  /**
   * @property value
   * @type {number}
   */
  get value() {
    let value;
    if (this.node && this.node.input) {
      value = this.node.input.value;
    }
    return value;
  }
  set value(val) {
    if (this.node && this.node.input) {
      this.node.input.value = Math.min(Math.max(val, this.min), this.max);
      this.onChange({
        bubbles: false,
        cancelable: false,
        currentTarget: this.node.input,
        eventPhase: 2,
        isTrusted: false,
        srcElement: this.node.input,
        target: this.node.input,
        timeStamp: performance.now(),
        type: 'change',
        composedPath: () => [
          this.node.input,
          document.body,
          document.getElementsByTagName('html').item(0),
          document,
          window
        ],
        preventDefault: () => undefined,
        stopImmediatePropagation: () => undefined,
        stopPropagation: () => undefined,
      });
    }
  }

  /**
   * @private
   * @method onChange
   * @description Event handler for change in value that calls the change handler passed in the
   * props with the change event and the Slider instance as arguments.
   * @returns {undefined}
   * @param {SyntheticEvent} e
   */
  onChange = (e) => {
    /* update the visual representation */
    if (this.node && this.node.rail && this.node.rail.clientWidth) {
      const value = e.target.value;
      const width = this.node.rail.clientWidth;
      const range = this.max - this.min;
      const adjusted = value - this.min;
      const percent = adjusted/(range || adjusted || 1);
      const edge = Math.floor(Math.min(percent, 1) * width);

      this.node.rail.setAttribute('data-value', value);

      if (this.node.fill) {
        this.node.fill.style.width = `${edge}px`;
      }
      if (this.node.marker) {
        const w = this.node.marker.offsetWidth;
        this.node.marker.setAttribute('aria-valuenow', value);
        this.node.marker.style.left = `${Math.max(Math.min(edge, edge - w), 0)}px`;
      }
    }

    /* bubble the change event */
    if (this.props.onChange) {
      this.props.onChange(e, this);
    }
  };

  /**
   * @private
   * @method onClick
   * @description Event handler for mouseclick
   * @returns {undefined}
   * @param {event} e
   */
  onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rail = this.node.rail;
    let percentage = (e.pageX - rail.offsetLeft) / rail.clientWidth;

    /* round the percentage so it's a multiple of the step value */
    let computed = ((this.max - this.min) * percentage);
    const offset = computed % (this.step || 1);
    if (offset) {
      computed -= offset;
      if (offset >= (this.step / 2)) {
        computed += this.step;
      }
    }

    /* set the computed value as distance from the min value */
    this.value = computed + this.min;

    /* make sure the input has focus */
    this.node.marker.focus();
  };

  /**
   * @private
   * @method onKeyDown
   * @description Event handler for keydown
   * @returns {undefined}
   * @param {event} e
   */
  onKeyDown = (e) => {
    if (this.shortcuts[e.key]) {
      this.shortcuts[e.key](e);
    }
  };

  /**
   * @private
   * @method onMouseDown
   * @description Event handler for mousedown
   * @returns {undefined}
   * @param {event} e
   */
  onMouseDown = (e) => {
    document.addEventListener('mousemove', this.onClick);
    document.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * @private
   * @method onMouseUp
   * @description Event handler for mouseup
   * @returns {undefined}
   * @param {event} e
   */
  onMouseUp = (e) => {
    document.removeEventListener('mousemove', this.onClick);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
Slider.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  markerStyle: PropTypes.object,
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  fillStyle: PropTypes.object,
  railStyle: PropTypes.object,
  sliderStyle: PropTypes.object,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
export default Slider;
