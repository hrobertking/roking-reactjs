/**
 * @author H Robert King <hrobertking@cathmhoal.com>
 * @class Menu
 * @description A menu is a widget that offers a list of choices to the user, such as a set of actions or functions. A menu is usually opened, or made visible, by activating a menu button, choosing an item in a menu that opens a sub menu, or by invoking a command, such as Shift + F10 in Windows, that opens a context specific menu. When a user activates a choice in a menu, the menu usually closes unless the choice opened a submenu.
 *
 * A menu that is visually persistent is a menubar. A menubar is typically horizontal and is often used to create a menu bar similar to those found near the top of the window in many desktop applications, offering the user quick access to a consistent set of commands.
 *
 * A common convention for indicating that a menu item launches a dialog box is to append "…" (ellipsis) to the menu item label, e.g., "Save as …".
 *
 * @see {@link https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-1/menubar-1.html}
 * @see {@link https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html}
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import './style.css';

/**
 * @example
 * <SubMenu label="Space Bears">
 *   <MenuItem href="/spacebear1" label="Space Bear 1" />
 *   <MenuItem href="/spacebear2" label="Space Bear 2" />
 * </SubMenu>
 */
export class SubMenu extends Component {
  constructor(props) {
    super(props);

    const expanded = !!props.expanded;

    this.id = props.id;
    this.label = props.label;

    this.children = React.Children.map(props.children, (child) => {
      return props.role ? React.cloneElement(child, { role: 'menuitem' }) : child;
    });

    this.state = {
      expanded,
    };
  }

  /**
   * @private
   * @description Index of the active item
   * @type {number}
   */
  get activeIndex() {
    const list = this.items;
    let i = list.length - 1;
    while (i > -1) {
      if (list[i].contains(document.activeElement)) {
        return i;
      }
      i -= 1;
    }
  }

  /**
   * @private
   * @description Button controller
   * @type {HTMLElement}
   */
  get controller() {
    return document.getElementById(`${this.id}-controller`);
  }

  /**
   * @private
   * @description Menu items
   * @type {HTMLElement[]}
   */
  get items() {
    const list = document.getElementById(this.id);
    if (list) {
      return [].slice.call(list.childNodes);
    }
    return [];
  }

  /**
   * @private
   * @description Sets focus on the first list item in the submenu
   * @returns {undefined}
   */
  first = () => {
    const items = this.items;
    if (items.length) {
      const target = items[0].querySelectorAll('a, button');

      if (target) {
        target.item(0).focus();
      }
    }
  };

  /**
   * @private
   * @description Sets focus to the controller button
   * @returns {undefined}
   */
  focus = () => {
    const btn = this.controller;
    if (btn) {
      btn.focus();
    }
  };

  /**
   * @private
   * @description Sets focus on the last list item in the submenu
   * @returns {undefined}
   */
  last = () => {
    const items = this.items;
    if (items.length) {
      const target = items[items.length - 1].querySelectorAll('a, button');

      if (target) {
        target.item(0).focus();
      }
    }
  };

  /**
   * @private
   * @description Sets focus on the next list item in the menu
   * @returns {undefined}
   */
  next = () => {
    const i = this.activeIndex;
    if (i || i === 0) {
      this.select(i + 1);
    }
  };

  /**
   * @private
   * @description Sets focus on the prev list item in the menu
   * @returns {undefined}
   */
  prev = () => {
    const i = this.activeIndex;
    if (i || i === 0) {
      this.select(i - 1);
    }
  };

  /**
   * @private
   * @description Searches the children to find a matching menu item. If no match is found,
   * the buffer is cleared.
   * @returns {undefined}
   */
  search = (key) => {
    const match = `${this.buffer || ''}${key}`;
    const pattern = new RegExp(`^${match}`, 'i');
    const items = this.items;
    let i = this.activeIndex || 0;
    while (i > -1 && i < this.items.length) {
      const item = this.items[i];
      if (pattern.test(item.textContent)) {
        this.buffer = match; 
        return this.select(i);
      }
      i += 1;
    }

    // if not found, clear the buffer of its previous contents
    this.buffer = '';
  };

  /**
   * @private
   * @description Sets focus on the specified list item in the menu
   * @returns {undefined}
   */
  select = (ndx) => {
    const lastIndex = this.items.length - 1;
    const i = ndx < 0 ?
      lastIndex :
      ndx > lastIndex ?
        0 :
        ndx;

    const content = this.items[i].querySelectorAll('a, button');
    if (content) {
      content.item(0).focus();
    }
  };

  /**
   * @private
   * @description Toggles the expanded state
   * @returns {undefined}
   */
  toggle = () => {
    const expanded = !this.state.expanded;
    this.setState({ expanded });
  };

  /**
   * @private
   * @description Handles the keydown event on the submenu
   * @returns {undefined}
   * @param {event} e
   */
  onKeyDown = (e) => {
    const {
      key,
      target,
    } = e;

    const handle = () => {
      e.stopPropagation();
      e.preventDefault();
    };

    switch (key) {
      case 'ArrowDown':
        handle();
        // focus first if target is the controller
        this.setState({ expanded: true });
        if (target === this.controller) {
          this.first();
        } else {
          this.next();
        }
        break;
      case 'ArrowLeft':
        if (target === this.controller) {
          // bubble
        } else if (this.activeIndex) {
          handle();
          this.prev();
        } else {
          handle();
          this.focus();
        }
        break;
      case 'ArrowRight':
        if (target === this.controller) {
          // bubble
        } else if (this.activeIndex !== this.items.length - 1) {
          handle();
          this.next();
        } else {
          handle();
          this.focus();
        }
        break;
      case 'ArrowUp':
        if (target !== this.controller) {
          handle();
          this.prev();
        }
        break;
      case 'Enter':
      case 'Space':
        break;
      case 'Home':
        handle();
        // open menu, focus first menu item
        this.setState({ expanded: true });
        this.first();
        break;
      case 'End':
        handle();
        // open menu, focus last menu item
        this.setState({ expanded: true });
        this.last();
        break;
      case 'Escape':
        handle();
        this.setState({ expanded: false });
        this.focus();
        break;
      case 'Tab':
        this.buffer = '';
        break;
      default:
        if (/^[a-z]{1}$/i.test(key)) {
          this.search(key);
        }
        break;
    }
  };

  render() {
    const {
      expanded,
    } = this.state;

    const className = `submenu ${this.props.className || ''}`.trim();
    const role = this.props.role ? 'menu' : null;

    return this.label && this.children && (
      <li className={className} role={this.props.role}>
        <button
          aria-haspopup="true"
          aria-expanded={expanded}
          className="submenu controller"
          id={`${this.id}-controller`}
          onClick={this.toggle}
          onKeyDown={this.onKeyDown}
        >
          {this.label}
        </button>
        <ul id={this.id} role={role} onKeyDown={this.onKeyDown}>
          {this.children}
        </ul>
      </li>
    );
  }
}
SubMenu.defaultProps = {
  id: `submenu-${(new Date()).getTime()}`,
  label: '',
};
SubMenu.propTypes = {
  expanded: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

/**
 * @example
 * <MenuItem action={() => { this.mode = 'fullscreen'; }} label="Use full screen" />
 * <MenuItem href="/spacebear1" label="Space Bear 1" />
 * <MenuItem href="/spacebear2" label="Space Bear 2" />
 */
export class MenuItem extends Component {
  constructor(props) {
    super(props);

    const noop = () => null;

    this.action = props.action || noop; 
    this.id = props.id;
    this.label = props.label;
  }

  render() {
    let current;
    if (this.props.current) {
      if (this.props.href) {
        current = 'page';
      } else if (this.action) {
        current = 'item';
      }
    }

    const className = `menuitem ${this.props.className || ''}`.trim();

    if (this.label && this.props.href) {
      return (
        <li className={className} role={this.props.role}>
          <a aria-current={current} href={this.props.href} onKeyDown={this.onKeyDown}>
            {this.label}
          </a>
        </li>
      );
    } else if (this.label && this.action) {
      return (
        <li className={className} role={this.props.role}>
          <button aria-current={current} type="button" onClick={this.action} onKeyDown={this.onKeyDown}>
            {this.label}
          </button>
        </li>
      );
    }
  }
}
MenuItem.defaultProps = {
  id: `menuitem-${(new Date()).getTime()}`,
  href: '',
  label: '',
};
MenuItem.propTypes = {
  action: PropTypes.func,
  expanded: PropTypes.bool,
  href: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

/**
 * @example
 * <Menu id="spacebears" label="Space Bears Menu">
 *   <MenuItem action={() => { this.mode = 'fullscreen'; }} label="Use full screen" />
 *   <SubMenu label="Space Bears">
 *     <MenuItem href="/spacebear1" label="Space Bear 1" />
 *     <MenuItem href="/spacebear2" label="Space Bear 2" />
 *   </SubMenu>
 * </Menu>
 *
 * @example
 * <Menu id="spacebears" label="Space Bears Menu" role="menu">
 *   <li role="menuitem">
 *     <button type="button" onclick="() => { this.mode = 'fullscreen'; }">
 *       Use full screen
 *     </button>
 *   </li>
 *   <li role="menuitem">
 *     <a href="/spacebear1">Space Bear 1</a>
 *   </li>
 *   <li role="menuitem">
 *     <a href="/spacebear2">Space Bear 2</a>
 *   </li>
 * </Menu>
 */
export class Menu extends Component {
  constructor(props) {
    super(props);

    this.id = props.id;
    this.label = props.label;

    this.children = React.Children.map(props.children, (child) => {
      return props.role ? React.cloneElement(child, { role: 'menuitem' }) : child;
    });

    const expanded = !!props.expanded;
    this.state = {
      expanded,
    };
  }

  /**
   * @private
   * @description Index of the active item
   * @type {number}
   */
  get activeIndex() {
    const list = this.items;
    let i = list.length - 1;
    while (i > -1) {
      if (list[i].contains(document.activeElement)) {
        return i;
      }
      i -= 1;
    }
  }

  /**
   * @private
   * @description Menu items
   * @type {HTMLElement[]}
   */
  get items() {
    const list = document.getElementById(this.id);
    if (list) {
      return [].slice.call(list.childNodes);
    }
    return [];
  }

  /**
   * @private
   * @description Sets focus on the first list item in the submenu
   * @returns {undefined}
   */
  first = () => {
    const items = this.items;
    if (items.length) {
      const target = items[0].querySelectorAll('a, button');

      if (target) {
        target.item(0).focus();
      }
    }
  };

  /**
   * @private
   * @description Sets focus to the list
   * @returns {undefined}
   */
  focus = () => {
    this.first();
  };

  /**
   * @private
   * @description Sets focus on the last list item in the submenu
   * @returns {undefined}
   */
  last = () => {
    const items = this.items;
    if (items.length) {
      const target = items[items.length - 1].querySelectorAll('a, button');

      if (target) {
        target.item(0).focus();
      }
    }
  };

  /**
   * @private
   * @description Sets focus on the next list item in the menu
   * @returns {undefined}
   */
  next = () => {
    const i = this.activeIndex;
    if (i || i === 0) {
      this.select(i + 1);
    }
  };

  /**
   * @private
   * @description Sets focus on the prev list item in the menu
   * @returns {undefined}
   */
  prev = () => {
    const i = this.activeIndex;
    if (i || i === 0) {
      this.select(i - 1);
    }
  };

  /**
   * @private
   * @description Searches the children to find a matching menu item. If no match is found,
   * the buffer is cleared.
   * @returns {undefined}
   */
  search = (key) => {
    const match = `${this.buffer || ''}${key}`;
    const pattern = new RegExp(`^${match}`, 'i');
    const items = this.items;
    let i = this.activeIndex || 0;
    while (i > -1 && i < this.items.length) {
      const item = this.items[i];
      if (pattern.test(item.textContent)) {
        this.buffer = match; 
        return this.select(i);
      }
      i += 1;
    }

    // if not found, clear the buffer of its previous contents
    this.buffer = '';
  };

  /**
   * @private
   * @description Sets focus on the specified list item in the menu
   * @returns {undefined}
   */
  select = (ndx) => {
    const lastIndex = this.items.length - 1;
    const i = ndx < 0 ?
      lastIndex :
      ndx > lastIndex ?
        0 :
        ndx;

    const content = this.items[i].querySelectorAll('a, button');
    if (content) {
      content.item(0).focus();
    }
  };

  /**
   * @private
   * @description Toggles the expanded state
   * @returns {undefined}
   */
  toggle = () => {
    const expanded = !this.state.expanded;
    this.setState({ expanded });
  };

  /**
   * @private
   * @description Handles the keydown event on the submenu
   * @returns {undefined}
   * @param {event} e
   */
  onKeyDown = (e) => {
    const {
      key,
      target,
    } = e;

    const handle = () => {
      e.stopPropagation();
      e.preventDefault();
    };

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        handle();
        this.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        handle();
        this.prev();
        break;
      case 'Home':
        handle();
        // open menu, focus first menu item
        this.first();
        break;
      case 'End':
        handle();
        // open menu, focus last menu item
        this.last();
        break;
      case 'Escape':
        handle();
        this.setState({ expanded: false });
        this.focus();
        break;
      default:
        if (/[a-z]/i.test(key)) {
          this.search(key);
        }
        break;
    }
  };

  render() {
    if (this.props.role && this.label && this.children) {
      return (
        <React.Fragment>
        <h2 id={`${this.id}-label`}>{this.label}</h2>
        <ul
          aria-labelledby={`${this.id}-label`}
          className={this.props.role}
          id={this.id}
          onKeyDown={this.onKeyDown}
          role={this.props.role}
        >
          {this.children}
        </ul>
        </React.Fragment>
      );
    }

    const className = `menu ${this.props.className || ''}`.trim();

    return this.label && this.children && (
      <nav aria-labelledby={`${this.id}-label`}>
        <h2 id={`${this.id}-label`}>{this.label}</h2>
        <ul
          className={className}
          id={this.id}
          onKeyDown={this.onKeyDown}
        >
          {this.children}
        </ul>
      </nav>
    );
  }
}
Menu.defaultProps = {
  id: `menu-${(new Date()).getTime()}`,
  label: '',
};
Menu.propTypes = {
  expanded: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  role: PropTypes.string,
};

