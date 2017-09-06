/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class AlertDialog
 *
 * @description A modal alert dialog. Accepts a `Controllers` child.
 *
 * @param {string} id
 * @param {string} label - The header to display.
 * @param {string} lang - The BCP-47 language code; default is 'en'
 * @param {function} onClose - ECMAScript function to run when dialog is dismissed. Two
 * arguments are passed into the `onClose` function: the AlertDialog instance and the event
 * that was passed into the `close` method.
 *
 * @example
 * const log = (alertDialog, e) => {
 *   const {
 *     target,
 *   } = e;
 *   console.log(alertDialog.html);
 *   switch (target.id) {
 *     case 'btnContinue':
 *       window.location.reload();
 *       break;
 *     case 'btnCancel':
 *       break;
 *   }
 * };
 *
 * <AlertDialog id="system-failure" label="Warning - Total System Failure" onClose={this.log}>
 *   <p>
 *     The system has experienced a catastrophic failure. Select 'Continue'
 *     to reboot, or 'Cancel' to shutdown.
 *   </p>
 *   <div className="controls" role="group">
 *     <button id="btnContinue">Continue</button>
 *     <button id="btnCancel">Cancel</button>
 *   </div>
 *   <footer>
 *    <p>This is a footer where we put &copy; 2018</p>
 *   </footer>
 * </AlertDialog>
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

class AlertDialog extends Component {
  constructor(props) {
    super(props);

    this.LABELS = {
      default: {
        close: 'Close',
      },
    };
    this.lang = this.LABELS.hasOwnProperty(props.lang) ?
      props.lang :
      'default';

    /* Loop through the children to pull out the `Controllers` children */
    this.children = React.Children.map(props.children, (child) => {
      const {
        type,
      } = child;

      return React.cloneElement(child, { onBlur: this.onBlur });
    });
    this.label = this.label || props.label;

    this.state = {
      show: true,
    };
  }

  componentDidMount() {
    this.open();
  }

  render() {
    if (!this.state.show) {
      return null;
    }

    /* set position of document body to eliminate cognitive a11y issues from background scrolling */
    const { id, label } = this.props;

    /**
     * When setting up the a11y links, keep in mind that
     * an `alertdialog` _must_ have an accessible name.
     * If a `label` (heading) has not been provided, we
     * must use the `children` (message) for the accessible
     * name.
     */
    let description;
    let header = `${id}-description`;

    if (this.label) {
      header = `${id}-head`;
      description = `${id}-description`;
    }

    return (
      <div
        className='overlay'
        onClick={this.close}
        style={{
          alignItems: 'center',
          background: 'rgba(204, 204, 204, 0.7)',
          bottom: 0,
          display: 'flex',
          left: 0,
          position: 'fixed',
          right: 0,
          top: 0,
          zIndex: this.zIndex,
        }}
      >
        <section
          aria-describedby={description}
          aria-labelledby={header}
          className='alertdialog'
          onClick={(e) => { e.stopPropagation(); }}
          role='alertdialog'
          ref={this.setRef}
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '1rem',
          }}
          tabIndex={0}
        >
          <header
            style={{
              display: 'flex',
            }}
          >
            <h2
              id={header}
              style={{
                flex: 1,
              }}
            >
              {label}
            </h2>
            <button
              aria-label={this.LABELS[this.lang].close}
              id={`${id}-closer`}
              onClick={this.close}
              style={{
                backgroundColor: 'transparent',
                color: 'rgb(0, 0, 0)',
                fontSize: '2rem',
                lineHeight: '1rem',
                margin: 0,
                minWidth: 0,
                padding: '0 0 0.5rem',
              }}
            >
              &times;
            </button>
          </header>
          <section
            className='body'
            id={description}
          >
            {this.children}
          </section>
        </section>
      </div>
    );
  }

  /**
   * @property children
   * @description The content displayed in the body of the AlertDialog.
   * @type {ReactJsElement[]}
   */

  /**
   * @property label
   * @description The header to display.
   * @type {string}
   */

  /**
   * @property lang
   * @description The BCP-47 language code; default is 'en'.
   * @type {string}
   */

  /**
   * @property html
   * @description The HTML of the AlertDialog
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
   * @description Binds the AlertDialog to the DOM using activeElement and event listeners.
   * @returns {undefined}
   */
  open = () => {
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
AlertDialog.defaultProps = {
  label: '',
};
AlertDialog.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  lang: PropTypes.string,
  onClose: PropTypes.func,
};
export default AlertDialog;
