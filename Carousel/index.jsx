/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Carousel
 *
 * @description A slideshow for cycling through a series of content.
 *
 * @param {boolean} [autoplay] - start animation on load
 * @param {string} [delay] - the number of milliseconds an item is current, defaults to 5000
 *
 * @example
 * <Carousel delay={3000} id="dogs" style={{height: '360px'}}>
 *   <a href="/dog1">
 *     <figure>
 *       <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Dogs%2C_jackals%2C_wolves%2C_and_foxes_%28Plate_XXXV%29.jpg" alt="dog1" />
 *       <figcaption>Dog 1</figcaption>
 *     </figure>
 *   </a>
 *   <a href="/dog2">
 *     <figure>
 *       <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/Dogs%2C_jackals%2C_wolves%2C_and_foxes_%28Plate_XX%29.jpg" alt="dog2" />
 *       <figcaption>Dog 2</figcaption>
 *     </figure>
 *   </a>
 *   <a href="/dog3">
 *     <figure>
 *       <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Dogs%2C_jackals%2C_wolves%2C_and_foxes_%28Plate_XXXII%29.jpg" alt="dog3" />
 *       <figcaption>Dog 3</figcaption>
 *     </figure>
 *   </a>
 *   <a href="/dog4">
 *     <figure>
 *       <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Dogs%2C_jackals%2C_wolves%2C_and_foxes_%28Plate_XV%29.jpg" alt="dog4" />
 *       <figcaption>Dog 4</figcaption>
 *     </figure>
 *   </a>
 * </Carousel>
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import './style.css';

class Carousel extends Component {
  constructor(props) {
    super(props);

    /* Loop through the children to pull out the `Controllers` children */
    this.items = React.Children.map(props.children, (child, i) => {
      return (
        <li data-index={i + 1}>
          {child}
        </li>
      );
    });

    this.state = {
      playing: !!props.autoplay,
    };
  }

  componentDidMount() {
    this.select(this.first);
    if (this.props.autoplay) {
      this.animate();
    }
  }

  render() {
    const {
      autoplay,
      delay,
      id,
      style,
      ...passthru,
    } = this.props;

    /* start/stop the animation timer */
    let animationControl;
    if (this.state.playing) {
      this.timer = setInterval(() => {
        this.select({ target: {
          name: 'next'
        }});
      }, delay || 5000);
      animationControl = (
        <button aria-label={this.labels.stop} type="button" onClick={this.stop}>▢</button>
      );
    } else {
      clearInterval(this.timer);
      animationControl = (
        <button aria-label={this.labels.play} type="button" onClick={this.animate}>▷</button>
      );
    }

    return (
      <React.Fragment>
      <section id={`${id}-section`} {...passthru}>
        <div className="carousel" style={style}>
          <ul className="viewer" id={id}>
            {this.items}
          </ul>
          <ul className="controls">
            <li>
              <button aria-label={this.labels.previous} type="button" name="previous" onClick={this.select}>
                ❮
              </button>
            </li>
            <li>
              <button aria-label={this.labels.next} type="button" name="next" onClick={this.select}>
                ❯
              </button>
            </li>
          </ul>
        </div>
        <ul aria-live="polite" aria-atomic="true" className="indicator">
          {this.items.map((item, index) => <li aria-label={index + 1}>◉</li>)}
        </ul>
      </section>
      {animationControl}
      </React.Fragment>
    );
  }

  get current() {
    return document.querySelector(`#${this.props.id} > li[aria-current]`);
  }

  get element() {
    return document.getElementById(this.props.id);
  }

  get first() {
    return this.element.getElementsByTagName('li').item(0);
  }

  get index() {
    return this.current && this.current.getAttribute('data-index');
  }

  get indicator() {
    return document.querySelector('.carousel + .indicator');
  }

  get labels() {
    switch (this.props.lang) {
      case 'es':
        return {
          next: 'Próximo',
          play: 'Animar',
          previous: 'Anterior',
          stop: 'Suspender',
        };
      case 'en':
      default:
        return {
          next: 'Next',
          play: 'Play',
          previous: 'Previous',
          stop: 'Stop',
        };
    }
  }

  get last() {
    return [].slice.call(this.element.getElementsByTagName('li')).pop();
  }

  get length() {
    return this.element.childNodes.length;
  }

  get next() {
    return this.current && this.current.nextElementSibling ?
      this.current.nextElementSibling :
      this.first;
  }

  get previous() {
    return this.current && this.current.previousElementSibling ?
      this.current.previousElementSibling :
      this.last;
  }


  /**
   * @private
   * @method animate
   */
  animate = () => {
    this.setState({ playing: true });
  };

  /**
   * @private
   * @method select
   * @returns {undefined}
   * @param {event} e
   */
  select = (e) => {
    const {
      target = { name: '' },
    } = e;

    let node = e;
    switch (target.name) {
      case 'next':
        node = this.next;
        break;
      case 'previous':
        node = this.previous;
        break;
      default:
    }

    if (this.current) {
      this.indicator.childNodes[this.index - 1].removeAttribute('aria-current');
      this.current.removeAttribute('aria-current');
    }

    if (node) {
      node.setAttribute('aria-current', 'item');
      this.indicator.childNodes[this.index - 1].setAttribute('aria-current', 'item');
    }
  };

  /**
   * @private
   * @method stop
   */
  stop = () => {
    this.setState({ playing: false });
  };
}
Carousel.defaultProps = {
  id: `carousel-${(new Date()).getTime()}`,
};
Carousel.propTypes = {
  autoplay: PropTypes.bool,
  delay: PropTypes.number,
  id: PropTypes.string,
};
export default Carousel;
