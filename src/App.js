import './App.scss';
import React, { Component } from 'react';
import Toolbar from 'react-md/lib/Toolbars';
import Helmet from 'react-helmet';
import Button from 'react-md/lib/Buttons/Button';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import Paper from 'react-md/lib/Papers';
import axios from 'axios';
import update from 'react-addons-update';
import moment from 'moment';
import Swipeable from 'react-swipeable'

class DateNavigator extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    today.setHours(0,0,0,0);
    this.state = {hasLimits: false, value: today, limits: {min: today, max: today}};
    this.pickerChanged = this.pickerChanged.bind(this);
    this.backButton = this.backButton.bind(this);
    this.forwardButton = this.forwardButton.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    axios.get(this.props.limitsUrl)
      .then(res => {
        const parseDate = (str) => moment(str, "YYYYMMDD").toDate();
        const limits = {min: parseDate(res.data.min), max: parseDate(res.data.max)}
        this.setState(update(this.state, {$merge: {hasLimits: true, limits: limits}}));
      });
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  handleKeyDown(event) {
    if(event.keyCode == 37) {
      this.backButton();
    }
    if (event.keyCode == 39) {
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
    if (moment(this.state.limits.min).isSameOrBefore(dateObject) &&
      dateObject.isSameOrBefore(moment(this.state.limits.max))) {
        this.setState(update(this.state, {$merge:
          {value: dateObject.toDate()}
        }));
        if (this.props.onChange) {
          this.props.onChange(dateObject.toDate());
        }
    }
  }

  pickerChanged(dateString, dateObject, event) {
    this.setState(update(this.state, {$merge:
      {value: dateObject}
    }));
    if (this.props.onChange) {
      this.props.onChange(dateObject);
    }
  }

  render() {
    return (
      <div className="md-cell md-cell--12">
      <div style={{float:"left"}}>
       <Button
         icon
         disabled={!this.state.hasLimits}
         onClick={this.backButton}>arrow_back</Button>
      </div>
      <div style={{float:"left"}}>
       <DatePicker
         disabled={!this.state.hasLimits}
         value={this.state.value}
         minDate={this.state.limits.min}
         maxDate={this.state.limits.max}
         onChange={this.pickerChanged} />
     </div>
     <div style={{float:"left"}}>
      <Button
        icon
        disabled={!this.state.hasLimits}
        onClick={this.forwardButton}>arrow_forward</Button>
     </div>
     </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false};
    this.dateChanged = this.dateChanged.bind(this);
    this.swippedLeft = this.swippedLeft.bind(this);
    this.swippedRight = this.swippedRight.bind(this);
  }

  componentDidMount() {
    axios.get('/daily/20170430.json')
    .then(res => {
      this.setState({loaded: true, daily: res.data});
    });
  }

  dateChanged(dateObject) {
    const date = moment(dateObject).format("YYYYMMDD");
    axios.get('/daily/' + date + '.json')
    .then(res => {
      this.setState({loaded: true, daily: res.data});
    }).catch(err => {
      this.setState({loaded: false});
    });

  }

  swippedLeft(e) {
    this.refs.dateNav.backButton();
  }

  swippedRight(e) {
    this.refs.dateNav.forwardButton();
  }

  render() {
    var items = "";
    if (this.state.loaded) {
      items = this.state.daily.map((item, i) =>
        <Paper zDepth="1" className="md-cell md-cell--2" style={{textAlign: "center", paddingTop: "5px"}}>
          <a href={"https://google.com/?q=" + item.label}>
          <img src={item.thumbnail} width="150px" /> <br/>
          #{i+1} &nbsp;
          {item.label}
        </a>
        </Paper>
      );
    }

    return (
      <div>
        <Helmet title="top-wikipedia.io" />
        <Toolbar
          colored
          title="Top wikipedia" />
        <Swipeable onSwipedLeft={this.swippedLeft}  onSwipedRight={this.swippedRight} >
          <div className="md-grid">
            <DateNavigator ref="dateNav" limitsUrl="/daily/limits.json" onChange={this.dateChanged} />
            {items}
          </div>
        </Swipeable>
      </div>
    );
    }
}

export default App;
