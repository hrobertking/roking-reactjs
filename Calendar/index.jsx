/**
 * @author Robert King <hrobertking@cathmhaol.com>
 * @class Calendar
 * @requires react
 * @requires prop-types
 * @see {@link https://github.com/hrobertking/angular/blob/master/ng-calendar/ng-calendar.js|Angular1.x version}
 *
 * @description Renders a calendar that will display a date and allow a user to select a date
 * @param {string} [classList] - classes to apply to the component
 * @param {string} [defaultValue] - default value in ISO 8601 format
 * @param {string} [hint] - a message to display after the calendar in the table footer
 * @param {object[]} [highlights] - an array of objects that list a date `value` and a string `type`
 * @param {string} [id] - id attribute of rendered component
 * @param {string} [info] - a status message to display at the end of the table
 * @param {string} [lang] - a BCP 47 language tag, defaults to 'en'
 * @param {object[]} [legend] - object array each with `type`, `description`, shows only if present
 * @param {string} [max] - the latest date that should be displayed
 * @param {object[]} [messages] - objects array each with `type` and `message`
 * @param {string} [min] - the earliest date that should be displayed
 * @param {number} [startOn] - first day of the week, 0 is Sunday, 6 is Saturday, defaults to 0
 * @param {function} [onCancel]
 * @param {function} [onChange]
 *
 * @example
 * <Calendar
 *   classList="holiday"
 *   defaultValue="2017-08-05"
 *   hint="Select the date for your next holiday"
 *   info="The next district recess is October 9"
 *   id="booking"
 *   lang="en"
 * />
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';

class Calendar extends React.Component {
  /**
   * @private
   * @description Sets the name collections used to generate the calendar before setting the date
   * @returns {undefined}
   * @param {object} props - the properties collection passed in
   */
  constructor(props) {
    super(props);

    /* set the day names using the js native function to get day names for days of the week */ 
    this.days = [];
    for (let ndx = 1; ndx < 8; ndx += 1) {
      this.days.push(
        (new Date(2017, 0, ndx)).toLocaleDateString(props.lang, { weekday: 'short' }),
      );
    }

    /* set the month names using the js native function */
    this.months = [];
    if (!this.months.length) {
      for (let ndx = 0; ndx < 12; ndx += 1) {
        const mm = new Date(2017, ndx, 1).toLocaleDateString(props.lang, { month: 'long' });
        this.months.push(mm);
      }
    }

    /* set max and min boundaries */
    if (props.max) {
      this.max = this.utc(props.max);
    }
    if (props.min) {
      this.min = this.utc(props.min);
    }

    /* add the hint and info props to the messages array */
    this.messages = props.messages || [];
    if (props.hint) {
      this.messages.push({ message: props.hint, type: 'hint' });
    }
    if (props.info) {
      this.messages.push({ message: props.info, type: 'info' });
    }

    /* build a legend using the default classes */
    const legendKey = {
      after: 'After the current month',
      before: 'Before the current month',
      selected: 'The date selected',
      today: 'The current date',
    };
    /* if there are highlights, add the keys to the legend */
    if (props.highlights && props.highlights.length) {
      for (let c = 0; c < props.highlights.length; c += 1) {
        const highlight = props.highlights[c];
        if (!Object.prototype.hasOwnProperty.call(legendKey, highlight.type)) {
          legendKey[highlight.type] = '';
        }
      }
    }
    /* pull descriptions from the legend if they exist */
    if (props.legend && props.legend.length) {
      for (let c = 0; c < props.legend.length; c += 1) {
        const item = props.legend[c];
        legendKey[item.type] = item.description || legendKey[item.type];
      }
    }
    const items = Object.keys(legendKey);
    const legend = [];
    for (let c = 0; c < items.length; c += 1) {
      legend.push(
        <tr>
          <td className={items[c]}></td>
          <td id={`calendar-legend-${items[c]}`}>{legendKey[items[c]]}</td>
        </tr>);
    }

    /* bind utility functions */
    this.getrender = this.getrender.bind(this);
    this.setrender = this.setrender.bind(this);

    /* bind event handlers */
    this.onNextMonth = this.onNextMonth.bind(this);
    this.onNextYear = this.onNextYear.bind(this);
    this.onPrevMonth = this.onPrevMonth.bind(this);
    this.onPrevYear = this.onPrevYear.bind(this);

    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);

    /* set the value */
    const value = /\d{4}(-\d{2})?(-\d{2})?/.test(props.defaultValue) ?
      props.defaultValue :
      '';

    /* set the rendering date */
    const {
      yy,
      mm,
      dd,
    } = this.dateparts(value ? new Date(value) : new Date());
    const renderDate = `${yy}-${mm}-${dd}`;

    this.state = {
      focused: false,
      legend,
      open: true,
      renderDate,
      value,
    };
  }

  /**
   * @private
   * @description Set focus when the component renders the calendar
   * @returns {undefined}
   */
  componentDidMount() {
    const renderDate = this.getrender().toISOString().substr(0, 10);

    for (let r = 0; r < this.element.rows.length; r += 1) {
      for (let c = 0; c < this.element.rows[r].cells.length; c += 1) {
        const ariaLabel = this.element.rows[r].cells[c].getAttribute('aria-label');
        if (ariaLabel === renderDate) {
          this.element.rows[r].cells[c].focus();
          break;
        }
      }
    }
  }

  /**
   * @private
   * @description Runs when props are updated
   * @returns {undefined}
   * @param {object} props
   */
  componentWillReceiveProps(props) {
    const {
      defaultValue,
    } = props;

    /* set the defaut starting date */
    const rdate = defaultValue ? new Date(defaultValue) : new Date();
    const {
      yy,
      mm,
      dd,
    } = this.dateparts(rdate);

    /* update the state */
    this.setState({
      renderDate: `${yy}-${mm}-${dd}`,
      value: defaultValue,
    });
  }

  /**
   * @private
   * @description Closes the calendar without returning a value
   * @returns {undefined}
   */
  close() {
    this.setState({ open: false });
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  /**
   * @private
   * @description Returns an object with date parts
   * @returns {object}
   * @param {date} d
   */
  dateparts(d) {
    return {
      yy: d && d.getUTCFullYear ? d.getUTCFullYear() : null,
      mm: d && d.getUTCMonth ? `0${d.getUTCMonth() + 1}`.substr(-2) : null,
      dd: d && d.getUTCDate ? `0${d.getUTCDate()}`.substr(-2) : null,
    };
  }

  /**
   * @private
   * @description Move focus to date cell at specified row and column
   * @returns {undefined}
   * @param {number} row - starting row index
   * @param {number} col - starting column index
   * @param {string} direction - motion
   */
  moveFocus(row, col, direction) {
    /* get handles to the different table parts */
    const tbody = this.table;
    const table = tbody ? tbody.parentNode : null;

    /* set common variables */
    const ROWS = {
      first: 2,
      last: tbody.rows[tbody.rows.length - 1].rowIndex,
    };
    const COLS = {
      first: 0,
      last: 6,
    };

    let rowIndex = row;
    let colIndex = col;

    switch (direction) {
      case 'down':
        rowIndex += 1;
        break;
      case 'end':
        colIndex = COLS.last;
        break;
      case 'home':
        colIndex = COLS.first;
        break;
      case 'left':
        colIndex -= 1;
        rowIndex = row + Math.min(0, colIndex - COLS.first);
        break;
      case 'up':
        rowIndex -= 1;
        break;
      case 'right':
        colIndex += 1;
        rowIndex = row + Math.max(0, colIndex - COLS.last);
        break;
      default:
    }

    /* resolve an out-of-bounds attempt */
    rowIndex = (rowIndex < ROWS.first) ? ROWS.last : rowIndex;
    colIndex = (colIndex < COLS.first) ? COLS.last : colIndex;
    rowIndex = (rowIndex > ROWS.last) ? ROWS.first : rowIndex;
    colIndex = (colIndex > COLS.last) ? COLS.first : colIndex;

    table.rows[rowIndex].cells[colIndex].focus();
  }

  /**
   * @private
   * @description Advances to the next month
   * @returns {undefined}
   * @param {event} e
   */
  onNextMonth(e) {
    const dt = this.getrender();
    dt.setMonth(dt.getMonth() + 1);

    /* check the boundary */
    const OK = (this.max) ?
      (this.max >= dt) :
      true;

    if (OK) {
      this.setrender(dt);
    }
  }

  /**
   * @private
   * @description Advances to the next year
   * @returns {undefined}
   * @param {event} e
   */
  onNextYear(e) {
    const dt = this.getrender();

    dt.setYear(dt.getUTCFullYear() + 1);

    /* check the boundary */
    const OK = (this.max) ?
      (this.max >= dt) :
      true;

    if (OK) {
      this.setrender(dt);
    }
  }

  /**
   * @private
   * @description Retreats one month
   * @returns {undefined}
   * @param {event} e
   */
  onPrevMonth(e) {
    const dt = this.getrender();

    dt.setMonth(dt.getMonth() - 1);

    /* check the boundary */
    const OK = (this.min) ?
      (this.min <= dt) :
      true;

    if (OK) {
      this.setrender(dt);
    }
  }

  /**
   * @private
   * @description Retreats one year
   * @returns {undefined}
   * @param {event} e
   */
  onPrevYear(e) {
    const dt = this.getrender();

    dt.setYear(dt.getUTCFullYear() - 1);

    /* check the boundary */
    const OK = (this.min) ?
      (this.min <= dt) :
      true;

    if (OK) {
      this.setrender(dt);
    }
  }

  /**
   * @private
   * @description Returns a UTC adjusted date
   * @returns {date}
   */
  getrender() {
    return this.utc(this.state.renderDate);
  }

  /**
   * @private
   * @description Sets the date render date
   * @returns {undefined}
   * @param {date} dt
   */
  setrender(dt) {
    const {
      yy,
      mm,
      dd,
    } = this.dateparts(dt);
    this.setState({ renderDate: `${yy}-${mm}-${dd}` });
  }

  /**
   * @private
   * @description Returns a UTC adjusted date
   * @returns {date}
   * @param {date|string} dt
   */
  utc(dt) {
    const value = dt.getTime ? dt : new Date(dt);
    return new Date(value.getTime() + (value.getTimezoneOffset() * 60000));
  }

  /**
   * @private
   * @description Set the class on the wrapper and bubble the onblur up
   * @returns {undefined}
   * @param {event} e
   */
  onBlur(e) {
    this.setState({ focused: false });
  }

  /**
   * @private
   * @description Bubbles the onchange event up.
   * @returns {undefined}
   * @param {event} e - the synthetic event from the handled interaction
   */
  onChange(e) {
    const {
      value,
    } = e.target;
    this.setState({ value, renderDate: value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * @private
   * @description Handles the click event of the datepicker
   * @returns {undefined}
   * @param {event} e
   */
  onClick(e) {
    /* set the 'value' property on the synthetic event to simulate an input */
    if (e.target && e.currentTarget) {
      const value = e.target.getAttribute('aria-label');
      e.target.value = value;
      e.currentTarget.value = value;
    }

    /* call the change event */
    this.onChange(e);
  }

  /**
   * @private
   * @description Reset the class on the wrapper and bubble the onfocus up
   * @returns {undefined}
   * @param {event} e
   */
  onFocus(e) {
    this.setState({ focused: true });
  }

  /**
   * @private
   * @description Handles the keypress event on a calendar table cell. The event handler must be
   * bound to keydown, because some UA do not pass directional keys in keypress or keyup.
   * @returns void
   * @param {event} e
   */
  onKeyDown(e) {
    /* get target details */
    const target = e.target;
    const row = target ? target.parentNode : null;
    const action = target.getAttribute('data-action') || 'Select';
    const data = target.getAttribute('aria-label');
    const parsed = /(\d{4})\D(\d{2})\D(\d{2})/.exec(data);
    const render = parsed && parsed.length > 3 ?
      `${parsed[1]}-${parsed[2]}-${parsed[3]}` :
      null;

    /* if the Enter key is hit, remap it */
    if (e.key === 'Enter') {
      e.key = action;
    }

    /* map the key to an action */
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'left');
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'up');
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'right');
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'down');
        break;
      case 'End':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'end');
        break;
      case 'Enter':
        /* this should never happen because it was re-mapped using the data-action attribute */
        e.preventDefault();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Home':
        e.preventDefault();
        this.moveFocus(row.rowIndex, target.cellIndex, 'home');
        break;
      case 'PageDown':
        e.preventDefault();
        if (e.altKey) {
          this.onNextYear();
        } else {
          this.onNextMonth();
        }
        break;
      case 'PageUp':
        e.preventDefault();
        if (e.altKey) {
          this.onPrevYear();
        } else {
          this.onPrevMonth();
        }
        break;
      case 'Select':
        e.preventDefault();
        if (render) {
          this.setState({ renderDate: render });
          e.target.value = render;
          e.currentTarget.value = render;
          this.onChange(e);
        }
        break;
      default:
    }
  }

  /**
   * @private
   * @description Renders the calendar
   * @returns {object} jsx
   */
  render() {
    const {
      focused,
      legend,
      value,
    } = this.state;

    const {
      classList,
      highlights,
      hint,
      id,
      info,
      startOn,
    } = this.props;

    const clsFocus = focused ? 'focused' : '';
    const className = `calendar ${clsFocus} ${classList}`.replace(/\s{2,}/, ' ').trim();

    const comp = this;
    const msPerDay = 60000 * 60 * 24;

    let d = this.getrender();

    /* set the month name */
    const {
      yy,
      mm,
      dd,
    } = this.dateparts(d);
    const month = mm;
    const monthName = this.months[month - 1];
    // eslint-disable-next-line no-mixed-operators
    const monthPrevName = this.months[month - 2 + (month < 2 ? 12 : 0)];
    const monthNextName = this.months[month % 12];

    /* set the 'start on' weekday */
    d.setDate(1);
    const firstDay = d.getUTCDay();
    if (firstDay !== startOn) {
      d = new Date(d.getTime() - msPerDay);
      while (d.getUTCDay() !== startOn) {
        d = new Date(d.getTime() - msPerDay);
      }
    }
    const disablePrev = (this.min || d) >= d;

    /* set the 'end on' weekday */
    const endOn = (startOn + 6) % 7;
    let lastDay = new Date(this.getrender());
    lastDay.setDate(1);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay = new Date(lastDay.getTime() - msPerDay);
    while (lastDay.getDay() !== endOn) {
      lastDay = new Date(lastDay.getTime() + msPerDay);
    }
    const disableNext = (this.max || lastDay) <= lastDay;

    /* get an array of dates to show */
    const dates = [];
    while (d.getTime() < lastDay.getTime() + 1) {
      dates.push(d);
      d = new Date(d.getTime() + msPerDay);
    }

    /* group the dates into weeks */
    const weeks = [];
    for (let w = 0; w < Math.floor(dates.length / 7) + 1; w += 1) {
      const week = dates.slice(w * 7, (w * 7) + 7);
      if (week.length) {
        weeks.push(week);
      }
    }

    const current = new Date();
    const selected = new Date(value);
    const rendered = this.getrender();

    return (
      <table
        className='calendar'
        ref={(node) => { this.element = node; }}
      >
        <thead>
          <tr className='control'>
            <th
              className={`previous month ${disableNext ? 'disabled' : ''}`}
              colSpan={1}
              data-action='PageUp'
              onClick={comp.onPrevMonth}
              onFocus={comp.onFocus}
              onKeyDown={comp.onKeyDown}
              role='button'
              tabIndex={0}
              title={`${disablePrev ? '' : monthPrevName}`}
            >
              &lt;
            </th>
            <th
              colSpan={5}
              tabIndex={0}
              onFocus={comp.onFocus}
              onKeyDown={comp.onKeyDown}
            >
              <span className='month'>{monthName}</span>
              <span className='year'>{yy}</span>
            </th>
            <th
              className={`next month ${disableNext ? 'disabled' : ''}`}
              colSpan={1}
              data-action='PageDown'
              onClick={comp.onNextMonth}
              onFocus={comp.onFocus}
              onKeyDown={comp.onKeyDown}
              role='button'
              tabIndex={0}
              title={`${disableNext ? '' : monthNextName}`}
            >
              &gt;
            </th>
          </tr>
          <tr>
            {
              comp.days.map((item, idx) => <th key={idx}>{item}</th>)
            }
          </tr>
        </thead>
        <tbody ref={(node) => { comp.table = node; }}>
          {
            weeks.map((week, wdx) => (
              <tr key={`week-${wdx}`}>
                {
                  week.map((day, ddx) => {
                    const classes = [];
                    const ariaDescribedBy = [];

                    /* set the class name to highlight periods before/after the month */
                    if ((day.getUTCMonth() < rendered.getUTCMonth()) ||
                        (day.getUTCFullYear() < rendered.getUTCFullYear())) {
                      classes.push('before');
                    } else if ((day.getUTCMonth() > rendered.getUTCMonth()) ||
                               (day.getUTCFullYear() > rendered.getUTCFullYear())) {
                      classes.push('after');
                    } else if ((day.getUTCFullYear() === current.getUTCFullYear()) &&
                               (day.getUTCMonth() === current.getUTCMonth()) &&
                               (day.getUTCDate() === current.getUTCDate())) {
                      classes.push('today');
                    }

                    /* set the class name to highlight the selected date */
                    if ((day.getUTCFullYear() === selected.getUTCFullYear()) &&
                        (day.getUTCMonth() === selected.getUTCMonth()) &&
                        (day.getUTCDate() === selected.getUTCDate())) {
                      classes.push('selected');
                    }

                    /* set the class name to highlight special dates */
                    if (highlights) {
                      for (let c = 0; c < highlights.length; c += 1) {
                        const check = new Date(highlights[c].value);

                        if ((day.getUTCFullYear() === check.getUTCFullYear()) &&
                            (day.getUTCMonth() === check.getUTCMonth()) &&
                            (day.getUTCDate() === check.getUTCDate())) {
                          classes.push(highlights[c].type);
                        }
                      }
                    }

                    /* set all the described-by ids */
                    for (let c = 0; c < classes.length; c += 1) {
                      ariaDescribedBy.push(`calendar-legend-${classes[c]}`);
                    }

                    const parts = comp.dateparts(day);

                    const ariaLabel = `${parts.yy}-${parts.mm}-${parts.dd}`;
                    const displayDate = day.getDate();

                    return (
                      <td
                        aria-describedby={ariaDescribedBy.join(' ')}
                        aria-label={ariaLabel}
                        className={classes.join(' ')}
                        role='button'
                        onBlur={comp.onBlur}
                        onClick={comp.onClick}
                        onFocus={comp.onFocus}
                        onKeyDown={comp.onKeyDown}
                        tabIndex={0}
                        key={ddx}
                      >
                        {displayDate}
                      </td>
                    );
                  })
                }
              </tr>
            ))
          }
        </tbody>
        { (this.messages.length || this.props.legend) &&
          <tfoot>
            { this.messages.length &&
              this.messages.map((message, idx) => (
                <tr className={message.type} key={idx}>
                  <td colSpan={7}>
                    {message.message}
                  </td>
                </tr>
              ))
            }
            <tr>
              <td colSpan={7}>
                <table className={`legend ${!this.props.legend ? 'at-only' : ''}`
                  .replace(/\s{2,}/, ' ').trim()}>
                  {legend}
                </table>
              </td>
            </tr>
          </tfoot>
        }
      </table>
    );
  }
}
Calendar.defaultProps = {
  classList: '',
  hint: '',
  info: '',
  lang: 'en',
  startOn: 0,
};
Calendar.propTypes = {
  classList: PropTypes.string,
  defaultValue: PropTypes.string,
  highlights: PropTypes.array,
  hint: PropTypes.string,
  id: PropTypes.string.isRequired,
  info: PropTypes.string,
  label: PropTypes.string,
  max: PropTypes.string,
  messages: PropTypes.array,
  min: PropTypes.string,
  startOn: PropTypes.number,
  onBlur: PropTypes.func,
  onCancel: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
};

export default Calendar;
