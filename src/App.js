import './App.scss';
import './md-icons.css';
import DateNavigator from './DateNavigator.js';
import NewsSidePanel from './NewsSidePanel.js';
import MoreActionsPanel from './MoreActionsPanel.js';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss'
import React, { Component } from 'react';
import Toolbar from 'react-md/lib/Toolbars';
import Helmet from 'react-helmet';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import LinearProgress from 'react-md/lib/Progress/LinearProgress';
import axios from 'axios';
import update from 'react-addons-update';
import moment from 'moment';
import Swipeable from 'react-swipeable'
import LazyLoad from 'react-lazyload';

class Card extends Component {
  render() {
    const item = this.props.item;
    return (
      <Paper key={"paper"+item.position} zDepth={1} className="md-cell md-cell--2" style={{textAlign: "center", paddingTop: "1em", paddingBottom: "1em", background: "white"}} >
        <div style={{overflow: "hidden"}}>
          <LazyLoad height="200px">
            <div style={{maxHeight: "26em", overflow: "hidden"}}>
              <img src={item.thumbnail} alt={item.label} style={{width: "88%"}} />
            </div>
          </LazyLoad> <br/>
            #{item.position+1}
            &nbsp; {item.label}
            {
              item.lang === "en"
              ? "" : <sub>({item.lang})</sub>
            }
           <br/> <br/>
         </div>
         {
           item.newsCount > 0 ?
            <Button tooltipLabel="Open News"
             onClick={this.props.onNewsButtonClicked}
             target="topic-window"
             icon
             secondary
             iconClassName="fa fa-newspaper-o fa-lg" /> : ""
         }
         <MoreActionsPanel item={item}/>
      </Paper>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: true, date: this.props.date};
    this.dateChanged = this.dateChanged.bind(this);
    this.swippedLeft = this.swippedLeft.bind(this);
    this.swippedRight = this.swippedRight.bind(this);
    this.newsButtonClicked = this.newsButtonClicked.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(update(this.state, {$merge:
      {date: nextProps.date}
    }));
    this.dateChanged(moment(nextProps.date, "YYYYMMDD"));
  }

  dateOrToday() {
    const date = moment(this.state.date, "YYYYMMDD");
    if (date.isValid()) {
      return date.toDate();
    }
    return new Date();
  }



  dateChanged(dateObject) {
    const date = moment(dateObject).format("YYYYMMDD");
    this.setState(update(this.state, {$merge:
      {loading: true, date: date}
    }));
    axios.get('daily_cat/' + date + '.json')
    .then(res => {
      history.pushState(null,null,'#' + date);
      window.ga('set', 'page', location.pathname+location.search+location.hash);
      window.ga('send', 'pageview');
      this.setState(update(this.state, {$merge:
        {loading: false, dailyCats: res.data}
      }));
    });
  }

  newsButtonClicked(record) {
    const date = moment(this.dateOrToday()).format("YYYYMMDD");
    this.refs.newsSidePanel.openNews(date, record.position, record.label);
  }

  swippedLeft(e) {
    this.refs.dateNav.forwardButton();
  }

  swippedRight(e) {
    this.refs.dateNav.backButton();
  }

  render() {
    var items = "";
    var cnt = 1;
    if (this.state.loading) {
      items = <LinearProgress id="itemLoader" />
    } else {
      items = this.state.dailyCats.map((cat, i) => {
        const recordPapers = cat.records.map((record, j) =>
          <Card key={"card" + cnt++} item={record} onNewsButtonClicked={() => this.newsButtonClicked(record)}  />
        );
        if (cat.category === "") {
          return (
            <div key={"card" + i} className="md-grid" style={{overflow: "hidden" }}>
              {recordPapers}
            </div>
          );
        } else {
          return (
            <div key={"card" + i} className="md-grid" style={{overflow: "hidden" }}>
              <Paper zDepth={3} className="md-grid md-cell md-cell--12" style={{overflow: "hidden", background: "url('cubicon.png')", backgroundSize: "35pt 20pt", backgroundColor: "#cc3344"}} >
                <div className="md-cell md-cell--12">
                  <h3 style={{whiteSpace: "normal", color: "white", textShadow: "1px 1px 3px black"}}>{cat.category}
                    {
                      cat.lang === "" || cat.lang === "en"
                      ? "" : <sub>({cat.lang})</sub>
                    }
                  </h3>
                </div>
                {recordPapers}
              </Paper>
            </div>
          );
        }
      });
    }

    return (
      <div>
        <Helmet title="fads today" />
        <Toolbar
          colored
          title={<div style={{fontSize: "17px", overflow: "hidden"}}> {"What's happening on " + moment(this.dateOrToday()).format("DD MMM YYYY")} </div>}
          style={{background: "url('toolbar-bg.jpg')", fontSize: "18px"}}
         />

       <Swipeable onSwipedLeft={this.swippedLeft}  onSwipedRight={this.swippedRight} delta={25} flickThreshold={0.7} preventDefaultTouchmoveEvent={true} >
          <div className="md-grid">
            <DateNavigator ref="dateNav" value={this.dateOrToday()} limitsUrl="daily_cat/limits.json" onChange={this.dateChanged} />
          </div>
          {items}
        </Swipeable>
        <NewsSidePanel ref="newsSidePanel" />
        <Toolbar
          style={{background: "url('toolbar-bg-bottom.jpg')", height: "160px"}}
          actions={[<Button
                     href="https://wikipedia.org"
                     secondary
                     raised
                     label="Powered by wikipedia.org" />,
                   <Button href="https://newsapi.org"
                            secondary
                            raised
                            label="newsapi.org" style={{marginLeft: "10px"}}/>]}
         />
      </div>
    );
    }
}

export default App;
