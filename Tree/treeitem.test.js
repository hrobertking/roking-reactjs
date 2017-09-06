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

  test('should move focus to next item when group does not exist on ArrowDown', () => {
    tree.find('#tg1-ti3').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('tg1-ti4');
  });
  test('should move focus to next item when group is expanded on ArrowDown', () => {
    tree.find('#ti1').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('ti2');
  });
  test('should move focus to collapsed group on ArrowDown', () => {
    tree.find('#tg1-ti2').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('tg1-ti2-tg1');
  });
  test('should move focus to next twice removed sibling when at the end of a group on ArrowDown', () => {
    tree.find('#tg1-ti4').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('ti2');
  });
  test('should move focus to previous item on ArrowLeft', () => {
    tree.find('#tg1-ti4').first().simulate('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement.id).toBe('tg1-ti3');
  });
  test('should stepInto group if one exists on ArrowRight', () => {
    tree.find('#tg1-ti2').first().simulate('keydown', { key: 'ArrowRight' });
    expect(document.activeElement.id).toBe('tg1-ti2-tg1');
  });
  test('should move to next item if no group exists on ArrowRight', () => {
    tree.find('#tg1-ti3').first().simulate('keydown', { key: 'ArrowRight' });
    expect(document.activeElement.id).toBe('tg1-ti4');
  });
  test('should move focus to next twice removed sibling when at the end on ArrowRight', () => {
    tree.find('#tg1-ti4').first().simulate('keydown', { key: 'ArrowRight' });
    expect(document.activeElement.id).toBe('ti2');
  });
  test('should move focus to next twice removed sibling when at the end on ArrowDown', () => {
    tree.find('#tg1-ti4').first().simulate('keydown', { key: 'ArrowDown' });
    expect(document.activeElement.id).toBe('ti2');
  });
  test('should move focus to previous item on ArrowUp', () => {
    tree.find('#ti2').first().simulate('keydown', { key: 'ArrowUp' });
    expect(document.activeElement.id).toBe('ti1');

    tree.find('#ti1').first().simulate('keydown', { key: 'ArrowUp' });
    expect(document.activeElement.id).toBe('tree');
  });
  test('should ignore unrecognized keys on the TreeItem', () => {
    const ae = document.activeElement;
    tree.find('#ti1').first().simulate('keydown', { key: 'A' });
    expect(document.activeElement).toBe(ae);
  });
});
