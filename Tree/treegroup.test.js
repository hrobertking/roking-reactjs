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

  test('should show error with invalid child of treegroup', () => {
    tree = mount(
      <TreeGroup>
        <li>Branch 1</li>
        <li>Branch 2</li>
      </TreeGroup>
    );
    expect(tree.find('h1').text()).toBe('Unable to render tree');

    tree = mount(
      <TreeGroup>
        <Tree />
      </TreeGroup>
    );
    expect(tree.find('h1').text()).toBe('Unable to render tree');
  });
  test('should focus on the tree group element when focus is called', () => {
    tree = mount(
      <TreeGroup id="tg-focus">
        <TreeItem>Branch 1</TreeItem>
        <TreeItem>Branch 2</TreeItem>
      </TreeGroup>
    );
    tree.instance().focus();
    expect(document.activeElement.id).toBe('tg-focus');
  });
  test('should not be expandable and not expanded when empty', () => {
    tree = mount(
      <TreeGroup />
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
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('true');
  });
  test('should collapse an expanded group on click', () => {
    tree.find('#ti1').find('ol').first().simulate('click');
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('group should expand a collapsed group on click', () => {
    tree.find('#ti1').find('ol').first().simulate('click');
    tree.find('#ti1').find('ol').first().simulate('click');
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('true');
  });
  test('should move focus to first item on ArrowDown', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('ti2');
  });
  test('should collapse an expanded group on ArrowLeft', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'ArrowLeft' });
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('should expand and stepInto collapsed group on ArrowRight', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'ArrowLeft' });
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'ArrowRight' });
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('true');
    expect(document.activeElement.id).toBe('tg1-ti1');
  });
  test('should move focus to parent on ArrowUp', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'ArrowUp' });
    expect(document.activeElement.id).toBe('ti1');
  });
  test('should toggle on Enter', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'Enter' });
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('false');
  });
  test('should ignore unrecognized keys on the TreeGroup', () => {
    tree.find('#ti1').find('ol').first().simulate('keydown', { key: 'A' });
    expect(tree.find('#ti1').find('ol').first().prop('aria-expanded')).toBe('true');
  });
});
