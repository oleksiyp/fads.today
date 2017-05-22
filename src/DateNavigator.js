import React, { Component } from 'react';
import Button from 'react-md/lib/Buttons/Button';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import update from 'react-addons-update';
import moment from 'moment';
import axios from 'axios';

export default class DateNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {hasLimits: false, value: null, limits: {min: null, max: null}};
    this.pickerChanged = this.pickerChanged.bind(this);
    this.backButton = this.backButton.bind(this);
    this.forwardButton = this.forwardButton.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.hasBackPages = this.hasBackPages.bind(this);
    this.hasForwardPages = this.hasForwardPages.bind(this);
  }

  componentDidMount() {
    axios.get(this.props.limitsUrl)
      .then(res => {
        const parseDate = (str) => moment(str, "YYYYMMDD").toDate();
        const limits = {min: parseDate(res.data.min), max: parseDate(res.data.max)}
        this.setState(update(this.state, {$merge: {hasLimits: true, limits: limits}}));
        this.changeDate(moment(this.props.value));
      });
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(update(this.state, {$merge:
      {value: nextProps.value}
    }));
  }

  handleKeyDown(event) {
    if(event.keyCode === 37) {
      this.backButton();
    }
    if (event.keyCode === 39) {
      this.forwardButton();
    }
  }

  backButton() {
    this.changeDate(moment(this.state.value).subtract(1, 'days'));
  }

  forwardButton() {
    this.changeDate(moment(this.state.value).add(1, 'days'));
  }

  changeDate(dateObject) {
    if (!this.state.hasLimits) return;

    dateObject = moment.max(dateObject, moment(this.state.limits.min));
    dateObject = moment.min(dateObject, moment(this.state.limits.max));

    if (this.state.value != null && moment(this.state.value).isSame(dateObject)) {
      return;
    }

    if (this.props.onChange) {
      this.props.onChange(dateObject.toDate());
    } else {
      this.setState(update(this.state, {$merge:
        {value: dateObject}
      }));
    }
  }

  pickerChanged(dateString, dateObject, event) {
    this.changeDate(moment(dateObject));
  }

  hasBackPages() {
    return this.state.hasLimits && moment(this.state.limits.min).isBefore(this.state.value)
  }

   hasForwardPages() {
    return this.state.hasLimits && moment(this.state.limits.max).isAfter(this.state.value)
  }

  render() {
    return (
      <div className="md-cell md-cell--12">
      <div style={{float:"left", paddingTop: "2px"}}>
       <Button
         icon
         secondary
         disabled={!this.hasBackPages()}
         onClick={this.backButton}
         iconClassName="fa fa-chevron-circle-left fa-2x"/>
      </div>
      <div style={{float:"left", width: "9em"}}>
       <DatePicker
         id="date"
         inline={true}
         fullWidth={false}
         disabled={!this.state.hasLimits}
         value={this.state.value}
         minDate={this.state.limits.min}
         maxDate={this.state.limits.max}
         onChange={this.pickerChanged} />
     </div>
     <div style={{float:"left", paddingTop: "2px"}}>
      <Button
        icon
        secondary
        disabled={!this.hasForwardPages()}
        onClick={this.forwardButton}
        iconClassName="fa fa-chevron-circle-right fa-2x"/>
     </div>
     </div>
    );
  }
}
