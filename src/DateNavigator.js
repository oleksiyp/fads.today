import React, { Component } from 'react';
import Button from 'react-md/lib/Buttons/Button';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import moment from 'moment';

export default class DateNavigator extends Component {
  constructor(props) {
    super(props);
    this.pickerChanged = this.pickerChanged.bind(this);
    this.backButton = this.backButton.bind(this);
    this.forwardButton = this.forwardButton.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.hasBackPages = this.hasBackPages.bind(this);
    this.hasForwardPages = this.hasForwardPages.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillReceiveProps(nextProps) {
    this.changeDate(nextProps.date);
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
    this.changeDate(moment(this.props.date).subtract(1, 'days'));
  }

  forwardButton() {
    this.changeDate(moment(this.props.date).add(1, 'days'));
  }

  changeDate(dateObj) {
    this.props.onChange(moment(dateObj).toDate());
  }

  pickerChanged(dateString, dateObject, event) {
    this.changeDate(dateObject);
  }

  hasBackPages() {
    return this.props.limits && moment(this.props.limits.min).isBefore(this.props.date)
  }

   hasForwardPages() {
    return this.props.limits && moment(this.props.limits.max).isAfter(this.props.date)
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
         disabled={!this.props.limits}
         value={this.props.date}
         minDate={this.props.limits ? this.props.limits.min : null}
         maxDate={this.props.limits ? this.props.limits.max : null}
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
