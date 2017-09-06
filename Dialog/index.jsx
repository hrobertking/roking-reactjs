/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Dialog
 *
 * @description An accessible modal overlay in React. A `closedialog` event bubbled to the
 * Dialog will close the dialog, event detail from the triggering event, e.g., 'click'
 * should be passed in the `detail` property of the CustomEvent.
 *
 * @param {string} id
 * @param {string} label - The header to display.
 * @param {string} lang - The BCP-47 language code; default is 'en'.
 * @param {function} onClose - ECMAScript function to run when the dialog is dismissed. Two
 * arguments are passed into the `onClose` function: the Dialog instance and the event that
 * was passed into the `close` method.
 *
 * @example
 * render() {
 *   // get  a little creative to bypass ReactJs silliness.
 *   const closeDialog = (e) => {
 *     const evt = new CustomEvent('closedialog', {
 *       bubbles: true,
 *       composed: true,
 *       detail: e,
 *     });
 *     e.target.parentNode.dispatchEvent(evt);
 *   };
 *
 *   // this.onClose example
 *   // onClose = (dialog, e) => {
 *   //   const {
 *   //     target,
 *   //   } = e;
 *   //   const data = {};
 *   //   switch (target.id) {
 *   //     'save':
 *   //       dialog.children.forEach(child => {
 *   //         data[child.props.name] = child.props.value;
 *   //       });
 *   //       upload(data);
 *   //       break;
 *   //     'delete':
 *   //       delete(dialog.props.data.id);
 *   //       break;
 *   //   }
 *   // }
 *
 *   return (
 *     <Dialog id="user-info" label="User Profile" onClose={this.onClose}>
 *       <fieldset id="fldset-name">
 *         <legend>Name</legend>
 *         <div>
 *           <input id="fname" name="fname" type="text" />
 *           <label htmlFor="fname">Given Name</label>
 *         </div>
 *         <div>
 *           <input id="lname" name="lname" type="text" />
 *           <label htmlFor="lname">Surame</label>
 *         </div>
 *       </fieldset>
 *       <fieldset id="fldset-email">
 *         <legend>Email</legend>
 *         <div>
 *           <input id="email" name="email" type="email" />
 *           <label htmlFor="email">Email</label>
 *         </div>
 *         <div>
 *           <select id="mtype" name="mtype">
 *             <option>Work</option>
 *             <option>Personal</option>
 *           </select>
 *           <label htmlFor="mtype">Email Type</label>
 *         </div>
 *       </fieldset>
 *       <div className="controls" role="group">
 *         <button id="btnOk" onClick={closeDialog}>OK</button>
 *         <button id="btnCancel" onClick={closeDialog}>Cancel</button>
 *       </div>
 *       <footer>
 *         &copy; hrobertking, 2018.
 *       </footer>
 *     </Dialog>
 *   );
 * }
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

export default class Dialog extends Component {
  constructor(props) {
    super(props);

    this.LABELS = {
      default: {
        close: 'Close',
      }
    };
    this.lang = this.LABELS.hasOwnProperty(props.lang) ?
      props.lang :
      'default';

    this.id = props.id;
    this.header = this.header || props.label;
    this.node = {};

    this.state = {
      show: true,
    };
  }

  componentDidMount() {
    this.setTrap();
    this.open();
  }

  render() {
    if (!this.state.show) {
      return null;
    }

    /**
     * When setting up the a11y links, keep in mind that a dialog _must_ have
     * an accessible name. If a `label` (heading) has not been provided, we
     * must use the `children` (content) for the accessible name.
     */
    let description;
    let label = `${this.id}-description`;

    if (this.label) {
      label = `${this.id}-header`;
      description = `${this.id}-description}`;
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
          aria-labelledby={label}
          className='dialog'
          onClick={(e) => { e.stopPropagation(); }}
          ref={this.setRef}
          role='dialog'
          style={{
            backgroundColor: 'rgb(255, 255, 255)',
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: '1rem',
            width: '50%',
          }}
          tabIndex={0}
        >
          <header
            style={{
              display: 'flex',
            }}
          >
            <h2
              id={label}
              style={{
                flex: 1,
              }}
            >
              {this.header}
            </h2>
            <button
              aria-label={this.LABELS[this.lang].close}
              id={`${this.id}-closer`}
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
            ref={this.setRef}
          >
            {this.props.children}
          </section>
        </section>
      </div>
    );
  }

  /**
   * @property children
   * @description The content displayed in the body of the Dialog.
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
   * @description The HTML of the Dialog
   * @type {string}
   */
  get html() {
    if (this.node.dialog) {
      return this.node.dialog.innerHTML;
    }
  }

  /**
   * @private
   * @property zIndex
   * @description Returns the highest z-index plus one.
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
   * @description Closes the modal
   * @returns {undefined}
   * @param {event} e
   */
  close = (e) => {
    this.node.body.removeEventListener('closedialog', this.close);
    this.reset();
    if (this.props.onClose) {
      this.props.onClose(this, (e.type === 'closedialog' ? e.detail : e));
    }
    this.setState({ show: false });
  };

  /**
   * @method open
   * @description Opens the dialog.
   * @returns {undefined}
   */
  open = () => {
    const activeElement = document.activeElement;
    const bodyPosition = document.body.style.position || 'static';

    /* set the reset function using the current active element and body position */
    this.reset = (ae = activeElement, bp = bodyPosition) => {
      document.body.style.position = bp;
      window.removeEventListener('keydown', this.onKeyDown);
      if (ae && ae.focus) {
        ae.focus();
      }
    };

    /* listen for close events from children */
    this.node.body.addEventListener('closedialog', this.close);

    window.addEventListener('keydown', this.onKeyDown);
    document.body.style.position = 'fixed';

    if (!this.state.show) {
      this.setState({ show: true });
    }

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
    if (this.node.dialog && !this.node.dialog.contains(e.relatedTarget)) {
      this.focus();
    }
  };

  /**
   * @private
   * @description Close the modal if the key hit is the ESC key.
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
    if (this.node.dialog) {
      this.node.dialog.focus();
    }
  };

  /**
   * @private
   * @description Sets the DOM reference for event handlers
   * @returns {undefined}
   * @param {HTMLElement} Node
   */
  setRef = (Node) => {
    if (Node) {
      this.node[Node.className] = Node;
    }
  };

  /**
   * @private
   * @description Sets the focus trap
   * @returns {undefined}
   */
  setTrap = () => {
    [].slice.call(this.node.dialog.getElementsByTagName('*'))
      .forEach(el => {
        el.addEventListener('focusout', this.onBlur);
      });
  };

}
Dialog.defaultProps = {
  label: '',
};
Dialog.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  lang: PropTypes.string,
  onClose: PropTypes.func,
};
