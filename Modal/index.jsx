/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Modal
 * @requires react
 * @requires prop-types
 * @see {@link https://www.w3.org/TR/wai-aria-practices/examples/dialog-modal/dialog.html|Modal Dialog Example}
 *
 * @description A modal dialog
 * @param {string} id
 * @param {string} header
 * @param {string} [lang] - The BCP-47 code to represent the language the dialog is using.
 * @param {function} [onClose] - An event handler for when the modal is closed.
 * @param {function} [onOpen] - An event handler for when the modal is shown.
 *
 * @example
 * <Modal id="tour" header="New Features Tour">
 *   <p>We've added a few new features</p>
 *   <ul>
 *     <li>Ion blasters in the palms of your hands.</li>
 *     <li>Enhanced temperature control to prevent icing at high altitude.</li>
 *     <li>Heat-seeking mini-missles in shoulder-mounted launchers.</li>
 *   </ul>
 *   <footer>
 *     <Controller controls="tour" label="Hide this" member="close" />
 *     <Controller controls="tour" label="Don't show this again" member="destroy" />
 *   </footer>
 * </Modal>
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

class Modal extends Component {
  constructor(props) {
    super(props);

    this.LABELS = {
      en: {
        close: 'Close',
      },
      es: {
        close: 'Cerrar',
      },
    };

    /* assign the blur handler to all the children so we create a focus trap */
    this.children = React.Children.map(props.children, (child) => 
        React.cloneElement(child, { onBlur: this.onBlur }));
    
    this.state = {
      destroy: false,
      show: true,
    };
  }

  componentDidMount() {
    this.open();
  }

  render() {
    const { destroy, show } = this.state;
    const { id, header } = this.props;
    const display = show ? 'flex' : 'none';

    let descriptionId;
    let headerId = `${id}-description`;

    if (header) {
      headerId = `${id}-head`;
      descriptionId = `${id}-description`;
    }

    return (
      !destroy ?
        <div
          className='overlay'
          onClick={this.close}
          /* the overlay covers the height and width of the viewport
           * with a translucent, light gray background and does not
           * have a visual focus indicator even though it can receive
           * focus
           */
          style={{
            alignItems: 'center',
            background: 'rgba(204, 204, 204, 0.7)',
            bottom: 0,
            display,
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: this.zIndex,
          }}
        >
          <section
            aria-describedby={descriptionId}
            aria-labelledby={headerId}
            className={`modal ${className}`}
            id={id}
            lang={this.lang}
            onClick={(e) => { e.stopPropagation(); }}
            role='dialog'
            ref={this.setRef}
            style={{
              background: '#fff',
              border: '1px solid #000',
              boxShadow: '0 0 1rem #666',
              margin: '1em auto',
              padding: '1em',
              width: '80%',
              { ...style }
            }}
          >
            <header
              style={{
                display: 'flex',
              }}
            >
              <h2
                id={headerId}
                style={{
                  flex: 1,
                  fontSize: '2rem',
                  lineHeight: '2rem',
                  margin: '0',
                  padding: '0',
                }}>{header}</h2>
              <button
                aria-label={this.LABELS[this.lang].close}
                id={`${id}-closer`}
                onClick={this.close}
                style={{
                  background: 'transparent',
                  color: '#000',
                  border: 'none',
                  display: 'inline-block',
                  flex: '1',
                  fontSize: '2rem',
                  lineHeight: '2rem',
                  margin: '0',
                  maxWidth: '2rem',
                  minWidth: '0',
                  padding: '0',
                  width: '2rem',
                }}
              >
                <span>&times;</span>
              </button>
            </header>
            <section
              className='body'
              id={descriptionId}
            >
              {this.children}
            </section>
          </section>
        </div> : null
    );
  }

  /**
   * @property children
   * @description The content displayed in the body of the Modal.
   * @type {ReactJsElement[]}
   */

  /**
   * @property lang
   * @description The BCP-47 language code; default is 'en'.
   * @type {string}
   */
  get lang() {
    return this.LABELS.hasOwnProperty(this.props.lang) ?
      this.props.lang :
      'en';
  }

  /**
   * @property html
   * @description The HTML of the Modal
   * @type {string}
   */
  get html() {
    if (this.element) {
      return this.element.innerHTML;
    }
  }

  /**
   * @private
   * @property zIndex
   * @description The highest z-index in the document plus one.
   * @type {string}
   */
  get zIndex() { // eslint-disable-line class-methods-use-this
    let z = 0;
    const list = document.getElementsByTagName('*');
    for (let c = list.length - 1; c > -1; c -= 1) {
      const computed = Number(list.item(c).style.zIndex);
      z = Math.max(z, (Number.isNaN(computed) ? 0 : computed));
    }
    return `${z + 1}`;
  }

  /**
   * @method close
   * @description Closes the modal by setting display to none and bubbles the event up
   * @returns {undefined}
   * @param {event} e
   */
  close = (e) => {
    this.reset();
    if (this.props.onClose) {
      this.props.onClose(this, e);
    }
    this.setState({ show: false });
  };

  /**
   * @method destroy
   * @description Destroys the modal and bubbles the event up
   * @returns {undefined}
   * @param {event} e
   */
  destroy = (e) => {
    this.close(e);
    this.setState({ destroy: true });
  };

  /**
   * @method open
   * @description Binds the Modal to the DOM using activeElement and event listeners.
   * @returns {undefined}
   * @param {event} e
   */
  open = (e) => {
    const activeElement = document.activeElement;
    const bodyPosition = document.body.style.position || 'static';

    this.reset = (ae = activeElement, bp = bodyPosition) => {
      document.body.style.position = bp;
      window.removeEventListener('keydown', this.onKeyDown);
      if (ae && ae.focus) {
        ae.focus();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);

    document.body.style.position = 'fixed';
    this.focus();

    if (this.props.onOpen) {
      this.props.onOpen(this, e);
    }
  };

  /**
   * @private
   * @description Prevents users from moving focus out of the dialog while it is open.
   * In the future, this might be handled by the `aria-modal` attribute, but for the
   * time, the `aria-modal` attribute has a defect that makes content inaccessible.
   * @returns {undefined}
   * @param {event} e
   */
  onBlur = (e) => {
    if (this.element && !this.element.contains(e.relatedTarget)) {
      e.stopPropagation();
      this.element.focus();
    }
  };

  /**
   * @private
   * @description Close the modal if the key hit is the ESC key
   * @returns {undefined}
   * @param {event} e
   */
  onKeyDown = (e) => {
    const {
      key,
      keyCode,
    } = e;

    if (/^Esc(ape)?$/.test(key) || keyCode === 27) {
      this.close(e);
    }
  };

  /**
   * @private
   * @description Focuses on the modal.
   * @returns {undefined}
   */
  focus = () => {
    if (this.element) {
      this.element.focus();
    }
  };

  /**
   * @private
   * @description Sets the DOM reference for event handlers
   * @returns {undefined}
   * @param {HTMLElement} node
   */
  setRef = (node) => {
    if (node) {
      this.element = node;
    }
  };
}
Modal.propTypes = {
  id: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  lang: PropTypes.string,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
};
export default Modal;
