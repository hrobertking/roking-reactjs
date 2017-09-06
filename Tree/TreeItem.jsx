/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class TreeItem
 * @requires `react`
 * @requires `prop-types`
 *
 * @description Renders a tree item
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

class TreeItem extends Component {
  constructor(props) {
    super(props);

    // map shortcuts
    this.shortcuts = {
      ArrowDown: this.next,
      ArrowLeft: this.previous,
      ArrowRight: this.stepInto,
      ArrowUp: this.previous,
    };
  }

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
   * @method focus
   * @description Sets the focus on the element
   * @returns {undefined}
   */
  focus = () => {
    this.element.focus();
  };

  /**
   * @method next
   * @description Moves focus to the next treeitem, searching children of the current item first,
   * and returns true if focus is moved.
   * @returns {boolean}
   */
  next = () => {
    const el = this.element.nextSibling;
    const subtree = this.element.getElementsByTagName('ol');
    const group = subtree.length ? subtree.item(0).getAttribute('role') === 'group' : false;
    const isExpanded = subtree.length ? subtree.item(0).getAttribute('aria-expanded') === 'true' : false;

    // if there is a sibling item,
    if (el && (!group || isExpanded)) {
      this.moveTo(el);
    // otherwise, if there is a group within this item,
    } else if (group) {
      this.moveTo(subtree.item(0));
    } else {
      // move up to the node containing the tree and its next sibling
      this.moveTo(this.element.parentNode.parentNode.nextSibling);
    }
  };

  /**
   * @method previous
   * @description Moves focus to the previous treeitem and returns true if focus is moved.
   * @returns {boolean}
   */
  previous = () => {
    const el = this.element.previousSibling ||
      this.element.parentNode;

    this.moveTo(el);
  };

  /**
   * @method stepInto
   * @description Moves focus to the next treeitem, searching children of the current item first,
   * and returns true if focus is moved.
   * @returns {boolean}
   */
  stepInto = () => {
    const el = this.element.nextSibling;
    const subtree = this.element.getElementsByTagName('ol');
    const group = subtree.length ? subtree.item(0).getAttribute('role') === 'group' : false;

    // if there is a group within this item,
    if (group) {
      this.moveTo(subtree.item(0));
    // otherwise, if there is a sibling item,
    } else if (el) {
      this.moveTo(el);
    } else {
      // move up to the node containing the tree and its next sibling
      this.moveTo(this.element.parentNode.parentNode.nextSibling);
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
    const {
      children,
    } = this.props;

    const props = { ...this.props };
    delete props.children;

    return (
      <li {...props}
        onKeyDown={this.onKeyDown}
        ref={this.setRef}
        role='treeitem'
        tabIndex={0}
      >
        {children}
      </li>
    );
  }
}

export default TreeItem;
