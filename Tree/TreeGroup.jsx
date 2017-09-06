/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class TreeGroup
 * @requires `react`
 * @requires `prop-types`
 *
 * @description Renders a sub-tree
 *
 * @example
 * import Tree from './index';
 * import TreeGroup from './TreeGroup';
 * import TreeItem from './TreeItem';
 * <Tree id="tree">
 *   <TreeItem id="ti1">
 *     <span>Branch 1</span>
 *     <TreeGroup expanded="true">
 *       <TreeItem id="tg1-ti1">
 *         <span>Submenu 1 : Branch 1</span>
 *         <TreeGroup>
 *           <TreeItem id="tg1-ti1-tg1-ti1">
 *             <span>Submenu 1 : Submenu 1 : Branch 1</span>
 *           </TreeItem>
 *           <TreeItem id="tg1-ti1-tg1-ti2">
 *             <span>Submenu 1 : Submenu 1 : Branch 2</span>
 *             <TreeGroup>
 *               <TreeItem id="tg1-ti1-tg1-ti2-tg1-ti1">
 *                 <span>Submenu 1 : Submenu 1 : Branch 2 : Submenu 1</span>
 *               </TreeItem>
 *             </TreeGroup>
 *           </TreeItem>
 *         </TreeGroup>
 *       </TreeItem>
 *       <TreeItem id="tg1-ti2">
 *         <span>Submenu 1: Branch 2</span>
 *         <TreeGroup expanded="false" id="tg1-ti2-tg1">
 *           <TreeItem id="tg1-ti2-tg1-ti1">
 *             <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 1</span>
 *           </TreeItem>
 *           <TreeItem id="tg1-ti2-tg1-ti2">
 *             <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 2</span>
 *             <TreeGroup>
 *               <TreeItem id="tg1-ti2-tg1-ti2-tg1-ti1">
 *                 <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 2 : Submenu 1 : Branch 1</span>
 *               </TreeItem>
 *             </TreeGroup>
 *           </TreeItem>
 *         </TreeGroup>
 *       </TreeItem>
 *       <TreeItem id="tg1-ti3">
 *         <span>Submenu 1 : Branch 3</span>
 *       </TreeItem>
 *       <TreeItem id="tg1-ti4">
 *         <span>Submenu 1 : Branch 4</span>
 *       </TreeItem>
 *     </TreeGroup>
 *   </TreeItem>
 *   <TreeItem id="ti2">
 *     <span>Branch 2</span>
 *   </TreeItem>
 * </Tree>
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TreeGroup extends Component {
  constructor(props) {
    super(props);

    let items = 0;
    // validate that the children are of the correct type
    React.Children.forEach(props.children, (child, index) => {
      const {
        type,
      } = child;

      if (typeof type !== 'function' || type.name !== 'TreeItem') {
        // initialize the error(s)
        this.error = this.error || [];
        this.error.push(`Invalid child type (${child.type}) at ${index + 1}`);
      } else {
        items += 1;
      }
    });

    // a TreeGroup is expandable if there is an 'expanded' property _or_ if there is more than
    // one child
    this.expandable = items > 1;

    // a TreeGroup can be either expanded or collapsed
    const expanded = !(props.expanded === 'false' || items === 0);

    // map shortcuts
    this.shortcuts = {
      ArrowDown: this.next,
      ArrowLeft: this.collapse,
      ArrowRight: () => { this.expand(); this.stepInto(); },
      ArrowUp: this.previous,
      Enter: this.toggle,
    };

    this.state = {
      expanded,
    };
  }

  /**
   * @property expanded
   * @description Whether or not the group is expanded so all items are visible
   * @type {boolean}
   */
  get expanded() {
    return this.state.expanded;
  }

  /**
   * @private
   * @description Click handler for the treeitem that toggles the expanded/collapsed state.
   * @returns {undefined}
   * @param {event} e
   */
  onClick = (e) => {
    e.stopPropagation();
    this.toggle();
  };

  /**
   * @private
   * @description Key handler for the treeitem that expands, collapses, or moves focus. An ArrowDown
   * will move focus down one treeitem; ArrowLeft collapses the treeitem unless it is already
   * collapsed, in which case it will move focus up one treeitem; ArrowRight expands the treeitem
   * unless it is already expanded, in which case it will move focus down the tree; ArrowUp will
   * move focus up one treeitem.
   * @returns {undefined}
   * @param {event} e
   */
  onKeyDown = (e) => {
    const {
      key,
    } = e;

    e.stopPropagation();
    if (this.shortcuts[key]) {
      this.shortcuts[key]();
    }
  };

  /**
   * @method collapse
   * @description Collapses the treeitem or moves the the previous treeitem.
   * @returns {undefined}
   */
  collapse = () => {
    if (this.expandable && this.expanded) {
      this.element.focus();
      this.setState({ expanded: false });
    }
  };

  /**
   * @method expand
   * @description Expands the treeitem or moves the the next treeitem.
   * @returns {undefined}
   */
  expand = () => {
    if (this.expandable && !this.expanded) {
      this.setState({ expanded: true });
    }
  };

  /**
   * @method focus
   * @description Sets focus on the element
   * @returns {undefined}
   */
  focus = () => {
    this.element.focus();
  };

  /**
   * @method next
   * @description Moves focus to the next treeitem, searching children of the current item first,
   * and returns true if focus is moved.
   * @returns {undefined}
   */
  next = () => {
    this.moveTo(this.element.parentNode.nextSibling);
  };

  /**
   * @method previous
   * @description Moves focus to the previous treeitem and returns true if focus is moved.
   * @returns {undefined}
   */
  previous = () => {
    this.moveTo(this.element.parentNode);
  };

  /**
   * @method stepInto
   * @description Moves focus to the next treeitem, searching children of the current item first,
   * and returns true if focus is moved.
   * @returns {undefined}
   */
  stepInto = () => {
    this.moveTo(this.element.firstChild);
  };

  /**
   * @method toggle
   * @description Toggles the expanded/collapsed state
   * @returns {undefined}
   */
  toggle = () => {
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  };

  /**
   * @private
   * @description Attempts to move to the specified treeitem and returns true if focus is moved.
   * @returns {undefined}
   */
  moveTo = (node) => {
    const keys = Object.keys(node);
    for (let c = 0; c < keys.length; c += 1) {
      const key = keys[c];
      if (key.startsWith('__reactInternalInstance$') &&
        node[key]._debugOwner.stateNode.focus) {
        node[key]._debugOwner.stateNode.focus();
      }
    }
  };

  /**
   * @private
   * @description Sets a reference to the HTMLElement that is the treeitem.
   * @returns {undefined}
   */
  setRef = (node) => {
    if (node) {
      this.element = node;
    }
  };

  render() {
    if (this.error) {
      return (
        <React.Fragment>
          <h1>Unable to render tree</h1>
          <pre>{this.error.join('\n')}</pre>
        </React.Fragment>
      );
    }

    const {
      children,
    } = this.props;

    const props = { ...this.props };
    delete props.children;

    if (this.expandable || this.expanded) {
      props['aria-expanded'] = this.expanded ? 'true' : 'false';
      props.tabIndex = 0;
    }

    /* the list item uses a div to mask the clickable surface */
    return (
      <ol {...props}
        data-expandable={this.expandable}
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
        ref={this.setRef}
        role='group'
        tabIndex={0}
      >
        {children}
      </ol>
    );
  }
}
TreeGroup.propTypes = {
  expanded: PropTypes.string,
};

export default TreeGroup;
