import { mount } from 'enzyme';
import React from 'react';

import Tree from './index';
import TreeGroup from './TreeGroup';
import TreeItem from './TreeItem';

describe('Tree', () => {
  let tree;

  beforeEach(() => {
    tree = mount(
      <Tree id="tree">
        <TreeItem id="ti1">
          <span>Branch 1</span>
          <TreeGroup expanded="true">
            <TreeItem id="tg1-ti1">
              <span>Submenu 1 : Branch 1</span>
              <TreeGroup>
                <TreeItem id="tg1-ti1-tg1-ti1">
                  <span>Submenu 1 : Submenu 1 : Branch 1</span>
                </TreeItem>
                <TreeItem id="tg1-ti1-tg1-ti2">
                  <span>Submenu 1 : Submenu 1 : Branch 2</span>
                  <TreeGroup>
                    <TreeItem id="tg1-ti1-tg1-ti2-tg1-ti1">
                      <span>Submenu 1 : Submenu 1 : Branch 2 : Submenu 1</span>
                    </TreeItem>
                  </TreeGroup>
                </TreeItem>
              </TreeGroup>
            </TreeItem>
            <TreeItem id="tg1-ti2">
              <span>Submenu 1: Branch 2</span>
              <TreeGroup expanded="false" id="tg1-ti2-tg1">
                <TreeItem id="tg1-ti2-tg1-ti1">
                  <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 1</span>
                </TreeItem>
                <TreeItem id="tg1-ti2-tg1-ti2">
                  <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 2</span>
                  <TreeGroup>
                    <TreeItem id="tg1-ti2-tg1-ti2-tg1-ti1">
                      <span>Submenu 1 : Branch 2 : Submenu 1 : Branch 2 : Submenu 1 : Branch 1</span>
                    </TreeItem>
                  </TreeGroup>
                </TreeItem>
              </TreeGroup>
            </TreeItem>
            <TreeItem id="tg1-ti3">
              <span>Submenu 1 : Branch 3</span>
            </TreeItem>
            <TreeItem id="tg1-ti4">
              <span>Submenu 1 : Branch 4</span>
            </TreeItem>
          </TreeGroup>
        </TreeItem>
        <TreeItem id="ti2">
          <span>Branch 2</span>
        </TreeItem>
      </Tree>
    );
  });
  afterEach(() => {
    tree.unmount();
  });

  // Tree
  test('should show error with invalid child of tree', () => {
    tree = mount(
      <Tree>
        <ol>
          <li>Branch 1</li>
          <li>Branch 2</li>
        </ol>
      </Tree>
    );
    expect(tree.find('h1').text()).toBe('Unable to render tree');

    tree = mount(
      <Tree>
        <Tree>
          <TreeItem>Branch 1</TreeItem>
        </Tree>
      </Tree>
    );
    expect(tree.find('h1').text()).toBe('Unable to render tree');
  });
  test('should show valid tree', () => {
    expect(tree.find('ol').first().prop('role')).toBe('tree');
  });
  test('should focus on the tree element when focus is called', () => {
    tree.instance().focus();
    expect(document.activeElement.id).toBe('tree');
  });
  test('should not be expandable and not expanded when empty', () => {
    tree = mount(
      <Tree />
    );
    expect(tree.find('ol').first().prop('aria-expanded')).toBeUndefined();
    // trigger a call to the expand function - it should still be unexpanded
    tree.instance().expand();
    expect(tree.find('ol').first().prop('aria-expanded')).toBeUndefined();
    // trigger a call to the collapse function - it should still be unexanded
    tree.instance().collapse();
    expect(tree.find('ol').first().prop('aria-expanded')).toBeUndefined();
  });
  test('should have \'expanded\' properly', () => {
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('true');
  });
  test('should collapse an expanded tree on click', () => {
    tree.find('ol').first().simulate('click');
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('should expand a collapsed tree on click', () => {
    tree.find('ol').first().simulate('click');
    tree.find('ol').first().simulate('click');
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('true');
  });
  test('should move focus to first item on ArrowDown', () => {
    tree.find('ol').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('ti1');
  });
  test('should collapse on ArrowLeft', () => {
    tree.find('ol').first().simulate('keydown', { key: 'ArrowLeft' });
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('should expand and stepInto collapsed tree on ArrowRight', () => {
    tree.find('ol').first().simulate('keydown', { key: 'ArrowLeft' });
    tree.find('ol').first().simulate('keydown', { key: 'ArrowRight' });
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('true');
    expect(document.activeElement.id).toBe('ti1');
  });
  test('should move focus to parent on ArrowUp', () => {
    tree.find('ol').first().simulate('keydown', { key: 'ArrowUp' });
    expect(document.activeElement).toBe(document.body);
  });
  test('should toggle on Enter', () => {
    tree.find('ol').first().simulate('keydown', { key: 'Enter' });
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('should ignore unrecognized keys on the Tree', () => {
    tree.find('ol').first().simulate('keydown', { key: 'A' });
    expect(tree.find('ol').first().prop('aria-expanded')).toBe('true');
  });
});
