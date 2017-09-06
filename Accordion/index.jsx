/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @class Accordion
 *
 * @description An 'accordion' object that expands/collapses when the header is clicked.
 *
 * @param {boolean} [expanded] - whether or not the content is expanded by default
 * @param {string} [id] - the identifier of the object
 * @param {string} label - the header to use when displaying the accordion
 *
 * @example
 * <Accordion label="Political Rhetoric">
 *   <p>
 *     Now is the time for all good men to come to the aid of their country.
 *   </p>
 *   <p>
 *     Ask not what your country can do for you. Ask what you can do for your country.
 *   </p>
 * </Accordion>
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import './style.css';

class Accordion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: !!props.expanded,
    };
  }

  toggle = (open) => {
    const expanded = !this.state.expanded;
    this.setState({ expanded });
  };

  render() {
    return this.label && (
      <section className="accordion" aria-expanded={this.state.expanded}>
        <header id={`${this.id}-label`} onClick={this.toggle}>{this.label}</header>
        <div aria-labelledby={`${this.id}-label`} role="region">
          {this.props.children}
        </div>
      </section>
    );
  }
}
Accordion.defaultProps = {
  expanded: true,
  id: `accordion-${(new Date()).getTime()}`,
  label: '',
};
Accordion.propTypes = {
  expanded: PropTypes.bool,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
export default Accordion;
