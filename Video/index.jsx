/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Video
 *
 * @description An accessible video player.
 *
 * @param {object} [buttons] - boolean properties that are a list of optional buttons: `forward`, `rewind`, and `stop`
 * @param {string} id
 * @param {string} [lang] - the BCP-47 language code for the language to use; default is 'en' 
 * @param {string} [mp4] - url for mp4 src
 * @param {string} [ogg] - url for ogg src
 * @param {string} [poster] - url for the poster to display
 * @param {jsxInlineStyle} [style]
 * @param {string} [synopsis] - the ID of the video description
 * @param {object} [timeStyle] - the `fill`, `rail`, and `slider` style definitions for the `time` slider
 * @param {object[]} [tracks] - an object array of `lang` and `src` for tracks used with the video
 * @param {object} [volumeStyle] - the `fill`, `rail`, and `slider` style definitions for the `volume` slider
 * @param {string} [webm] - url for webm src
 *
 * @example
 * <Video
 *   buttons={{
 *     forward: true,
 *     rewind: true,
 *     stop: true,
 *   }}
 *   synopsis="big-buck-bunny-synopsis"
 *   id="big-buck"
 *   lang="en-US"
 *   mp4="https://ia800300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
 *   poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217"
 *   tracks={[
 *     {lang: 'en-US', src: 'subtitles_en.vtt'},
 *     {lang: 'de-DE', src: 'subtitles_de.vtt'},
 *   ]}
 * />
 * <p id="big-buck-bunny-synopsis">
 * </p>
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import LABELS from './lang.js';
import './style.css';

/**
 * @private
 * @description Returns a React component using the HTMLElement
 * @returns {React.Component|null}
 * @param {HTMLElement|string} node
 */
const getReactComponent = (node) => {
  let el = node;
  if (el) {
    el = typeof el === 'string' ? document.getElementById(el) : el;
    const keys = Object.keys(el);
    for (let c = 0; c < keys.length; c += 1) {
      const key = keys[c];
      if (key.startsWith('__reactInternalInstance$')) {
        return el[key]._debugOwner.stateNode;
      }
    }
  }
  return null;
}

/**
 * @class TimeIndicator
 *
 * @description Creates a 'slider' used to display and manipulate the time index. Dispatches a
 * change event when the value is changed.
 *
 * @param {string} id
 * @param {string} label - the label used to describe the input, i.e., 'time' or it's equivalent
 * @param {number} max - the maximum value the slider can have, i.e., the duration of the video
 * @param {number} min - the minimum value the slider can have, i.e., zero
 * @param {jsxInlineStyle} [fill] - styles to apply to the slider fill
 * @param {jsxInlineStyle} [marker] - styles to apply to the marker
 * @param {jsxInlineStyle} [rail] - styles to apply to the slider rail
 * @param {jsxInlineStyle} [slider] - styles to apply to the slider
 * @param {jsxInlineStyle} [style] - styles to apply to the component 
 * @param {number} step - the number of unites to increment/decrement on each update, i.e., 1
 * @param {number} value - the default value
 */
class TimeIndicator extends Component {
  constructor(props) {
    super(props);

    this.id = props.id;
    this.label = props.label || '';
    this.max = Number(props.max || 0);
    this.min = Number(props.min || 0);
    this.step = Number(props.step || 1);

    this.defaultValue = Number(props.value || this.min);

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

  componentWillReceiveProps(props) {
    this.max = Number(props.max);
    this.min = Number(props.min);
    this.value = Number(props.value);
  }

  render() {
    return (
      <div
        className='timeindicator'
        id={this.id}
        style={{
          ...this.props.style,
          ...this.props.slider,
          display: 'flex',
          position: 'relative',
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
            ...this.props.rail,
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
              ...this.props.fill,
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
                ...this.props.fill,
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
              ...this.props.marker,
              display: 'inline-block',
              position: 'relative',
            }}
            tabIndex={0}
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
   * @description Event handler for change in value
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
      const edge = Math.min(percent, 1) * width;

      this.node.rail.setAttribute('data-value', value);

      if (this.node.fill) {
        this.node.fill.style.width = `${edge}px`;
      }
      if (this.node.marker) {
        const w = this.node.marker.offsetWidth / 2;
        this.node.marker.setAttribute('aria-valuenow', value);
        this.node.marker.style.left = `${Math.max(Math.min(edge, edge - w), 0)}px`;
      }
    }

    /* bubble the change event */
    if (this.props.onChange) {
      this.props.onChange(e);
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
    e.preventDefault();
    e.stopPropagation();

    this.node.rail.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  /**
   * @private
   * @method onMouseMove
   * @description Event handler for mousemove
   * @returns {undefined}
   * @param {event} e
   */
  onMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    /* set that mousemove is triggered */
    this.mouseMoving = true;

    const rail = this.node.rail;
    const width = rail.clientWidth || 1;
    const offsetX = e.clientX - rail.getBoundingClientRect().left;
    const percentage = offsetX / width;

    /* round the percentage so it's a multiple of the step value */
    let computed = ((this.max - this.min) * percentage);
    const offset = computed % (this.step || 1);
    if (offset) {
      computed -= offset;
      if (offset >= (this.step / 2)) {
        computed += this.step;
      }
    }

    /* set the computed value as the distance from the min value */
    this.value = computed + this.min;
  };

  /**
   * @private
   * @method onMouseUp
   * @description Event handler for mouseup
   * @returns {undefined}
   * @param {event} e
   */
  onMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.node.rail.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
TimeIndicator.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  marker: PropTypes.object,
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  fill: PropTypes.object,
  rail: PropTypes.object,
  slider: PropTypes.object,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/**
 * @class Track
 *
 * @description Creates a subtitle track using the specified language.
 *
 * @param {string} lang - the BCP-47 code of the language the track uses
 * @param {string} src - the url of the track source
 */
class Track extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <track
        kind='subtitles'
        label={LABELS[this.lang].name}
        src={this.props.src}
        srcLang={this.lang}
        onCueChange={() => this.props.onCueChange ? this.props.onCueChange(this.cues.shift()) : null }
      />
    );
  }

  /**
   * @property cues
   * @type {object[]}
   */
  get cues() {
    return [ ...this.track.track.activeCues ];
  }

  /**
   * @property lang
   * @description The BCP-47 code to be used. Default is 'en'.
   * @type {string}
   */
  get lang() {
    const [language, region] = this.props.lang.split('-');
    
    if (LABELS.hasOwnProperty(this.props.lang)) {
      return this.props.lang;
    } else if (LABELS.hasOwnProperty(region)) {
      return region;
    } else if (LABELS.hasOwnProperty(language)) {
      return language;
    }
    return 'en';
  };
};
Track.propTypes = {
  lang: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

/**
 * @class Volume
 *
 * @description Creates a 'slider' used to display and manipulate the playback volume. Dispatches a
 * change event when the value is changed.
 *
 * @param {string} id
 * @param {string} label - the label used to describe the input, i.e., 'volume' or it's equivalent
 * @param {number} max - the maximum value the slider can have, i.e., 10
 * @param {number} min - the minimum value the slider can have, i.e., zero
 * @param {jsxInlineStyle} [fill] - styles to apply to the slider fill
 * @param {jsxInlineStyle} [marker] - styles to apply to the marker
 * @param {jsxInlineStyle} [rail] - styles to apply to the slider rail
 * @param {jsxInlineStyle} [slider] - styles to apply to the slider
 * @param {jsxInlineStyle} [style] - styles to apply to the component
 * @param {number} step - the number of unites to increment/decrement on each update, i.e., 1
 * @param {number} value - the default value
 */
class Volume extends Component {
  constructor(props) {
    super(props);

    this.id = props.id;
    this.label = props.label || '';
    this.max = Number(props.max || 0);
    this.min = Number(props.min || 0);
    this.step = Number(props.step || 1);

    this.defaultValue = Number(props.value || this.min);

    this.shortcuts = {
      ArrowDown: () => this.value = Number(this.value) - this.step,
      ArrowLeft: () => this.value = Number(this.value) - this.step,
      ArrowRight: () => this.value = Number(this.value) + this.step,
      ArrowUp: () => this.value = Number(this.value) + this.step,
      End: () => this.value = this.max,
      Escape: () => this.close(),
      Home: () => this.value = this.min,
      PageDown: () => this.value = Number(this.value) - (10 * this.step),
      PageUp: () => this.value = Number(this.value) + (10 * this.step),
    };
  }

  componentDidMount() {
    this.node = {
      control: document.getElementById(this.id),
      input: document.getElementById(`${this.id}-input`),
      fill: document.getElementById(`${this.id}-fill`),
      rail: document.getElementById(`${this.id}-rail`),
      marker: document.getElementById(`${this.id}-marker`),
    };

    /* set the value _after_ the input node has been mounted */
    this.value = this.defaultValue;
    delete this.defaultValue;

    this.close();
  }

  render() {
    return (
      <div
        className='volumeknob'
        id={this.id}
        onBlur={this.onBlur}
        style={{
          ...this.props.style,
          ...this.props.slider,
          display: 'flex',
          position: 'relative',
          outline: 'none',
        }}
        tabIndex={0}
      >
        <div
          className='rail'
          id={`${this.id}-rail`}
          data-max={this.max}
          data-min={this.min}
          data-value={this.value}
          onClick={this.onClick}
          style={{
            height: '6rem',
            margin: '0 1rem',
            width: '1rem',
            ...this.props.rail,
            position: 'absolute',
            bottom: 0,
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
              border: '1px solid',
              bottom: 0,
              display: 'block',
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          />
          <div
            className='fill'
            id={`${this.id}-fill`}
            style={{
              ...this.props.fill,
              bottom: 0,
              display: 'block',
              left: 0,
              position: 'absolute',
              right: 0,
            }}
          />
          <div
            aria-label={this.label}
            aria-valuemax={this.max}
            aria-valuemin={this.min}
            aria-valuenow={this.value}
            draggable='true'
            id={`${this.id}-marker`}
            onKeyDown={this.onKeyDown}
            onMouseDown={this.onMouseDown}
            role='slider'
            style={{
              left: '-0.5rem',
              minHeight: '2rem',
              minWidth: '2rem',
              right: '-0.5rem',
              ...this.props.marker,
              bottom: 0,
              display: 'inline-block',
              position: 'absolute',
              marginBottom: '-100%',
            }}
            tabIndex={0}
          />
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
   * @method close
   * @description Closes the control by setting display to 'none'.
   * @returns {undefined}
   */
  close = () => {
    if (this.node.control) {
      this.node.control.style.display = 'none';
    }
    if (this.props.onClose) {
      try {
        this.props.onClose();
      } catch (ignore) {
      }
    }
  };

  /**
   * @method open
   * @description Opens the control
   * @returns {undefined}
   */
  open = () => {
    if (this.node.control) {
      this.node.control.style.display = 'flex';
    }
    if (this.node.marker) {
      this.node.marker.focus();
    }

    if (this.props.onOpen) {
      try {
        this.props.onOpen();
      } catch (ignore) {
      }
    }
  };

  /**
   * @private
   * @method onBlur
   * @description Event handler for blur events
   * @returns {undefined}
   * @param {SyntheticEvent} e
   */
  onBlur = (e) => {
    const {
      relatedTarget = document.activeElement,
    } = e;

    if (!this.node.control.contains(relatedTarget)) {
      this.close();
    }
  };

  /**
   * @private
   * @method onChange
   * @description Event handler for change in value
   * @returns {undefined}
   * @param {SyntheticEvent} e
   */
  onChange = (e) => {
    /* update the visual representation */
    if (this.node && this.node.rail) {
      const value = e.target.value;
      const range = this.max - this.min;
      const adjusted = value - this.min;
      const percent = adjusted/(range || adjusted || 1);

      this.node.rail.setAttribute('data-value', value);

      if (this.node.fill) {
        this.node.fill.style.height = `${Math.ceil(percent * 100)}%`;
      }

      if (this.node.marker) {
        this.node.marker.setAttribute('aria-valuenow', value);
        this.node.marker.style.bottom = `${Math.ceil(percent * 100)}%`;
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

    /* a 'drag' event also triggers a click event so we check to
     * limit what we're handling with one user interaction
     */
    if (!this.mouseMoving) {
      const rail = this.node.rail;
      const evt = e.nativeEvent;
      const height = evt.target.clientHeight || 1;
      const offsetY = evt.offsetY || 0;
      const percentage = 1 - (offsetY / height);

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
    } else {
      delete this.mouseMoving;
    }
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
      e.preventDefault();
      e.stopPropagation();

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
    e.preventDefault();
    e.stopPropagation();

    this.node.rail.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  /**
   * @private
   * @method onMouseMove
   * @description Event handler for mousemove
   * @returns {undefined}
   * @param {event} e
   */
  onMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    /* set that mousemove is triggered */
    this.mouseMoving = true;

    const rail = this.node.rail;
    const height = rail.clientHeight || 1;
    const offsetY = e.clientY - rail.getBoundingClientRect().top;
    const percentage = 1 - (offsetY / height);

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
  };

  /**
   * @private
   * @method onMouseUp
   * @description Event handler for mouseup
   * @returns {undefined}
   * @param {event} e
   */
  onMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.node.rail.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
Volume.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  marker: PropTypes.object,
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  fill: PropTypes.object,
  rail: PropTypes.object,
  slider: PropTypes.object,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  style: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

class Video extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      style = {
        objectFit: 'contain',
        width: '100%',
      },
    } = this.props;
    if (this.props.poster) {
      style = {
        ...style,
        background: `transparent url("${this.props.poster}") center no-repeat`,
        backgroundSize: 'contain',
      };
    }
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <video
          aria-describedby={this.props.synopsis}
          id={this.props.id}
          className='player'
          ref={this.setRef}
          style={style}
          onCanPlay={(e) => this.forceUpdate()}
          onTimeUpdate={this.updateProgress}
        >
          { this.props.mp4 &&
            <source src={this.props.mp4} type='video/mp4' />
          }
          { this.props.ogg &&
            <source src={this.props.ogg} type='video/ogg' />
          }
          { this.props.webm &&
            <source src={this.props.webm} type='video/webm' />
          }
          { this.props.tracks.map(track => <Track
                key={`${track.lang}-subtitles`}
                lang={track.lang}
                src={track.src}
                onCueChange={(cue) => {
                  this.node.caption.innerHTML = cue;
                }}
              />
            )
          }
          <p>{LABELS[this.lang].unsupported}</p>
        </video>
        <div
          className='caption'
          data-state={0}
          ref={this.setRef}
        />
        <div
          className='video controls'
          role='group'
          style={{
            alignSelf: 'center',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {
            <button
              accessKey='P'
              aria-label={LABELS[this.lang].play}
              className='play'
              data-state={1}
              ref={this.setRef}
              type='button'
              onClick={this.play}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <path className='on' d='M 20 10 L 70 45 L 20 80 Z'/>
                <g className='off'>
                  <rect x='20' y='10' width='20' height='70'/>
                  <rect x='50' y='10' width='20' height='70'/>
                </g>
              </svg>
            </button>
          }
          { this.props.buttons.stop &&
            <button
              accessKey='X'
              aria-label={LABELS[this.lang].stop}
              className='stop'
              ref={this.setRef}
              type='button'
              onClick={this.stop}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <rect x='25' y='25' width='40' height='40'></rect>
              </svg>
            </button>
          }
          { this.props.buttons.rewind &&
            <button
              accessKey='Q'
              aria-label={LABELS[this.lang].rewind}
              className='rewind'
              ref={this.setRef}
              type='button'
              onClick={this.rewind}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <path d='M 80 80 L 60 65 L 60 25 L 80 10 Z'/>
                <path d='M 60 80 L 10 45 L 60 10 Z'/>
              </svg>
            </button>
          }
          { this.props.buttons.forward &&
            <button
              accessKey='W'
              className='forward'
              ref={this.setRef}
              type='button'
              onClick={this.forward}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <path d='M 10 10 L 30 25 L 30 65 L 10 80 Z'/>
                <path d='M 30 10 L 80 45 L 30 80 Z'/>
              </svg>
            </button>
          }
          {
            <div>
              <Volume
                id={`${this.props.id}-volumeknob`}
                label={LABELS[this.lang].volume}
                max={10}
                min={0}
                value={0}
                onChange={(evt, vol) => {
                  const {
                    max,
                    value,
                  } = vol;

                  this.volume(Math.min(value / (max || 1), 1));
                }}

                { ...this.props.volumeStyle }
              />
              <button
                accessKey='S'
                aria-label={LABELS[this.lang].sound}
                className='sound'
                data-state={1}
                ref={this.setRef}
                type='button'
                onClick={() => {
                  const knob = getReactComponent(`${this.props.id}-volumeknob`);
                  if (knob) {
                    knob.open();
                  }
                }}
              >
                <svg id={`${this.props.id}-volume`} viewBox='0 0 90 90' role='presentation'>
                  <path d='M 9 25 L 25 25 L 41 13 L 41 69 L 25 57 L 9 57 Z'/>
                  <g className='on'>
                    <path className='soft' d='M 49 33 C 52 38 52 44 49 49' style={{ fill: 'none' }}/>
                    <path className='medium' d='M 57 25 C 65 34 65 48 57 57' style={{ fill: 'none' }}/>
                    <path className='loud' d='M 65 17 C 72 23 76 32 76 41 C 76 50 72 59 65 65' style={{ fill: 'none' }}/>
                  </g>
                  <path className='off' d='M 81 26 L 51 56 M 51 26 L 81 56'/>
                </svg>
              </button>
            </div>
          }
          { this.props.tracks &&
            <button
              accessKey='C'
              aria-label={LABELS[this.lang].captions[0]}
              className='captions'
              data-state={0}
              ref={this.setRef}
              type='button'
              onClick={this.captions}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <path d='M 10 10 L 80 10 L 80 50 L 60 50 L 35 80 L 40 50 L 10 50 Z'/>
                <line className='off' x1='10' x2='80' y1='80' y2='10'/>
              </svg>
            </button>
          }
          {
            <button
              accessKey='F'
              aria-label={LABELS[this.lang].fullscreen[0]}
              className='fullscreen'
              data-state={0}
              ref={this.setRef}
              type='button'
              onClick={this.resize}
            >
              <svg viewBox='0 0 90 90' role='presentation'>
                <path
                  className='off'
                  d='M 55 35 L 65 35 L 65 30 L 80 45 L 65 60 L 65 55 L 55 55 L 55 65 L 60 65 L 45 80 L 30 65 L 35 65 L 35 55 L 25 55 L 25 60 L 10 45 L 25 30 L 25 35 L 35 35 L 35 25 L 30 25 L 45 10 L 60 25 L 55 25 Z'/>
                <g className='on'>
                  <path d='M 15 80 L 7 73 L 23 56 L 15 49 L 40 46 L 37 71 L 30 63 Z'/>
                  <path d='M 63 30 L 71 37 L 46 40 L 49 15 L 56 23 L 73 7 L 80 15 Z'/>
                </g>
              </svg>
            </button>
          }
        </div>
        <div
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              flex: 0,
              margin: '0 1rem 0 0',
            }}
          >
            {this.toTimeString(this.timeIndex, 2)}
          </div>
          <TimeIndicator
            id={`${this.props.id}-timeindicator`}
            label={LABELS[this.lang].time}
            onChange={(e) => {
              this.timeIndex = e.target.value;
            }}
            max={this.duration}
            min={0}
            style={{
              flex: 2,
            }}
            value={this.timeIndex}

            { ...this.props.timeStyle }
          />
          <div
            style={{
              flex: 0,
              margin: '0 0 0 1rem',
            }}
          >
            {this.toTimeString(this.duration, 2)}
          </div>
        </div>
      </div>
    );
  }

  /**
   * @property completion
   * @description Percentage complete
   * @type {number}
   */
  get completion() {
    const {
      duration,
      timeIndex,
    } = this;

    return duration ? (timeIndex / (duration || 1)) : 1;
  }

  /**
   * @property duration
   * @description Duration of the video.
   * @type {number}
   */
  get duration() {
    return this.node && this.node.player ? this.node.player.duration || 0 : 0;
  }

  /**
   * @property lang
   * @description The BCP-47 code to be used. Default is 'en'.
   * @type {string}
   */
  get lang() {
    const [language, region] = this.props.lang.split('-');
    
    if (LABELS.hasOwnProperty(this.props.lang)) {
      return this.props.lang;
    } else if (LABELS.hasOwnProperty(region)) {
      return region;
    } else if (LABELS.hasOwnProperty(language)) {
      return language;
    }
    return 'en';
  };

  /**
   * @property timeIndex
   * @description Current time index.
   * @type {number}
   */
  get timeIndex() {
    return this.node && this.node.player ? this.node.player.currentTime || 0 : 0;
  }
  set timeIndex(ts) {
    const n = Math.max(Math.min(this.duration, Math.floor(Number(ts))), 0);
    this.node.player.currentTime = n;
  }

  /**
   * @method captioning
   * @returns {undefined}
   * @param {event} e
   */
  captions = (e) => {
    const state = this.node.captions.getAttribute('data-state') === '0' ? 1 : 0;
    this.node.caption.setAttribute('aria-label', LABELS[this.lang].captions[state]);
    this.node.caption.setAttribute('data-state', state);

    this.node.captions.setAttribute('aria-label', LABELS[this.lang].captions[state]);
    this.node.captions.setAttribute('data-state', state);
  };

  /**
   * @method forward
   * @description Fast forward at 4x the normal speed
   * @returns {undefined}
   * @param {event} e
   */
  forward = (e) => {
    this.node.player.play();
    this.node.player.playbackRate = 4;
  };

  /**
   * @method play
   * @description Starts/pauses playback of the video
   * @returns {undefined}
   * @param {event} e
   * @param {boolean} force
   */
  play = (e, force) => {
    let state = this.node.play.getAttribute('data-state') === '0' || force ? 1 : 0;
    this.node.play.setAttribute('aria-label', LABELS[this.lang].play[state]);
    this.node.play.setAttribute('data-state', state);
    switch (state) {
      case 0:
        this.node.player.playbackRate = 1;
        this.node.player.play();
        break;
      default:
        clearInterval(this.rewinding);
        this.node.player.pause();
        break;
    }
  };

  /**
   * @method resize
   * @description Switches between full-screen and initial size
   * @returns {undefined}
   * @param {event} e
   */
  resize = (e) => {
    const state = this.node.fullscreen.getAttribute('data-state') === '0' ? 1 : 0;

    const toggleResize = (e) => {
      const {
        key,
        keyCode,
      } = e;
      if (key === 'Escape' || keyCode === 27) {
        this.resize();
      }
    };

    if (state) {
      // show fullscreen
      const el = document.documentElement;
      (
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullScreen
      ).call(el);

      document.addEventListener('keydown', toggleResize);
      this.node.player.parentNode.style.width = '100%';
    } else {
      (
        document.exitFullscreen ||
        document.msExitFullscreen ||
        document.mozCancelFullScreen ||
        document.webkitExitFullscreen
      ).call();

      document.removeEventListener('keydown', toggleResize);
      this.node.player.parentNode.style.width = 'auto';
    }

    this.node.fullscreen.setAttribute('aria-label', LABELS[this.lang].fullscreen[state]);
    this.node.fullscreen.setAttribute('data-state', state);
  };

  /**
   * @method rewind
   * @description Rewind the video at 4x the normal speed
   * @returns {undefined}
   * @param {event} e
   */
  rewind = (e) => {
    this.node.player.playbackRate = 1.0;
    this.rewinding = setInterval(() => {
      this.timeIndex = Math.max(0, this.timeIndex - .1);
      if (this.timeIndex === 0) {
        this.play(null, false);
        this.forceUpdate();
      }
    }, 100);
  };

  /**
   * @method stop
   * @description Stops playback of the video and reset the currentTime index.
   * @returns {undefined}
   * @param {event} e
   */
  stop = (e) => {
    this.node.player.pause();
    this.node.player.currentTime = 0;
    this.node.play.setAttribute('aria-label', LABELS[this.lang].play[1]);
    this.node.play.setAttribute('data-state', 1);
  };

  /**
   * @method volume
   * @description Sets the volume to a percentage and updates the display to reflect the new volume.
   * @returns {undefined}
   * @param {number} n
   */
  volume = (n) => {
    const normalized = Math.max(Math.min(n, 1), 0);
    this.node.player.volume = normalized;

    const indicator = document.getElementById(`${this.props.id}-volume`);
    const levels = ['soft', 'medium', 'loud'];
    const level = (normalized < .1) ? 'off' : levels[Math.floor((normalized * 10)/4)];

    indicator && indicator.setAttribute('data-level', level);
  };

  /**
   * @private
   * @method setRef
   * @description Sets the HTMLElement reference for select nodes.
   * @returns {undefined}
   * @param {HTMLElement} node
   */
  setRef = (node) => {
    this.node = this.node || {}; 
    if (node && node.className) {
      this.node[node.className] = node;
    }
  };

  /**
   * @private
   * @method toTimeString
   * @description Converts seconds to a time string approximating ISO 8601 with the addition
   * of left-most members for days and years, i.e., y{1,}:d{1,3}:h{1,2}:m{1,2}:s{1,2}
   * @returns {string}
   * @param {number} secs
   * @param {number} minlength - the minimum groups to return
   */
  toTimeString = (secs, minlength = 0) => {
    let remainder = secs;

    const str = [];
    const splitter = [
      (n) => { // years
        const mod = 365 * 24 * 60 * 60 * 1;
        const num = `${Math.floor(n/mod)}`;
        const reduction = mod * Number(num);
        return { reduction, num };
      },
      (n) => { // days
        const mod = 24 * 60 * 60 * 1;
        const num = `00${Math.floor(n/mod)}`.substr(-3);
        const reduction = mod * Number(num);
        return { reduction, num };
      },
      (n) => { // hours
        const mod = 60 * 60 * 1;
        const num = `0${Math.floor(n/mod)}`.substr(-2);
        const reduction = mod * Number(num);
        return { reduction, num };
      },
      (n) => { // minutes
        const mod = 60 * 1;
        const num = `0${Math.floor(n/mod)}`.substr(-2);
        const reduction = mod * Number(num);
        return { reduction, num };
      },
      (n) => { // seconds
        const mod = 1;
        const num = `0${Math.floor(n/mod)}`.substr(-2);
        const reduction = mod * Number(num);
        return { reduction, num };
      },
    ];

    /* calculate the various parts from years to seconds */
    for (let c = 0; c < splitter.length; c += 1) {
      const {
        num,
        reduction,
      } = splitter[c](remainder);
      str.push(num);
      remainder -= reduction;
    }
    
    /* trim leading zero groups */
    const leading0 = /^0+:/;
    let timestring = str.join(':');
    while (leading0.test(timestring) && timestring.split(':').length > minlength) {
      timestring = timestring.replace(leading0, '');
    }

    return timestring;
  };

  /**
   * @private
   * @method updateProgress
   * @description Updates the progress bar
   * @returns {undefined}
   * @param {event} e
   */
  updateProgress = (e) => {
    let {
      currentTime,
      value,
    } = e.target;

    currentTime = currentTime || value || 0;

    this.lastIndex = this.lastIndex || 0;
    if (Math.floor(currentTime) - this.lastIndex) {
      this.lastIndex = Math.floor(currentTime);
      this.forceUpdate();
    }
  };
}
Video.defaultProps = {
};
Video.propTypes = {
  buttons: PropTypes.shape({
    forward: PropTypes.bool,
    rewind: PropTypes.bool,
    stop: PropTypes.bool,
  }),
  id: PropTypes.string.isRequired,
  lang: PropTypes.string,
  mp4: PropTypes.string,
  ogg: PropTypes.string,
  poster: PropTypes.string,
  style: PropTypes.object,
  synopsis: PropTypes.string,
  timeStyle: PropTypes.shape({
    fill: PropTypes.object,
    marker: PropTypes.object,
    rail: PropTypes.object,
    slider: PropTypes.object,
  }),
  tracks: PropTypes.arrayOf(PropTypes.shape({
    lang: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
  })),
  volumeStyle: PropTypes.shape({
    fill: PropTypes.object,
    marker: PropTypes.object,
    rail: PropTypes.object,
    slider: PropTypes.object,
  }),
  webm: PropTypes.string,
};
export default Video;
