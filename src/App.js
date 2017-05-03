import './App.scss';
import React, { Component } from 'react';
import Toolbar from 'react-md/lib/Toolbars';
import Helmet from 'react-helmet';
import Button from 'react-md/lib/Buttons/Button';
import DatePicker from 'react-md/lib/Pickers/DatePickerContainer';
import Paper from 'react-md/lib/Papers';
import FontIcon from 'react-md/lib/FontIcons';
import axios from 'axios';
import update from 'react-addons-update';
import moment from 'moment';
import Swipeable from 'react-swipeable'
import LazyLoad from 'react-lazyload';

class DateNavigator extends Component {
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
        this.changeDate(moment(new Date()));
      });
    document.addEventListener("keydown", this.handleKeyDown, false);
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
    if (this.state.value == null || !moment(this.state.value).isSame(dateObject)) {
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

  hasBackPages() {
    return this.state.hasLimits && moment(this.state.limits.min).isBefore(this.state.value)
  }

   hasForwardPages() {
    return this.state.hasLimits && moment(this.state.limits.max).isAfter(this.state.value)
  }

  render() {
    return (
      <div className="md-cell md-cell--12">
      <div style={{float:"left", paddingTop: "3px"}}>
       <Button
         icon
         secondary
         disabled={!this.hasBackPages()}
         onClick={this.backButton}
         className="fa fa-chevron-circle-left fa-2x"/>
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
     <div style={{float:"left", paddingTop: "3px"}}>
      <Button
        icon
        secondary
        disabled={!this.hasForwardPages()}
        onClick={this.forwardButton}
        className="fa fa-chevron-circle-right fa-2x"/>
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

  dateChanged(dateObject) {
    const date = moment(dateObject).format("YYYYMMDD");
    this.setState({loaded: false});
    axios.get('daily/' + date + '.json')
    .then(res => {
      this.setState({loaded: true, daily: res.data});
    });
  }

  swippedLeft(e) {
    this.refs.dateNav.forwardButton();
  }

  swippedRight(e) {
    this.refs.dateNav.backButton();
  }

  render() {
    var items = "";
    if (this.state.loaded) {
      items = this.state.daily.map((item, i) =>
        <Paper key={"paper"+i} zDepth={1} className="md-cell md-cell--2" style={{textAlign: "center", paddingTop: "1em", paddingBottom: "1em"}}>
          <LazyLoad height="200px">
            <img src={item.thumbnail} alt={item.label} style={{width: "88%"}} />
          </LazyLoad> <br/>
            #{i+1}
            &nbsp; {item.label} ({item.lang})
           <br/> <br/>
           <Button tooltipLabel="Open in Wikipedia" href={"https://" + item.lang + ".wikipedia.org/wiki/Special:Search?search=" + item.label} icon secondary className="fa fa-wikipedia-w fa-lg" />
           <Button tooltipLabel="Open in Google" href={"https://google.com/search?q=" + item.label} icon secondary className="fa fa-google fa-lg" />
        </Paper>
      );
    }

    return (
      <div>
        <Helmet title="Daily wikipedia top" />
        <Toolbar
          colored
          title="Articles rated by page views"
         />

        <Swipeable onSwipedLeft={this.swippedLeft}  onSwipedRight={this.swippedRight} >
          <div className="md-grid">
            <DateNavigator ref="dateNav" limitsUrl="daily/limits.json" onChange={this.dateChanged} />
            {items}
          </div>
        </Swipeable>
      </div>
    );
    }
}

export default App;
