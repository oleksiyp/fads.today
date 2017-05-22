import './App.scss';
import './md-icons.css';
import DateNavigator from './DateNavigator.js';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss'
import React, { Component } from 'react';
import Toolbar from 'react-md/lib/Toolbars';
import Helmet from 'react-helmet';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import Drawer from 'react-md/lib/Drawers';
import Divider from 'react-md/lib/Dividers';
import LinearProgress from 'react-md/lib/Progress/LinearProgress';
import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import Dialog from 'react-md/lib/Dialogs';
import FontIcon from 'react-md/lib/FontIcons';
import axios from 'axios';
import update from 'react-addons-update';
import moment from 'moment';
import Swipeable from 'react-swipeable'
import LazyLoad from 'react-lazyload';



class NewsSidePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {newsDrawerVisible: false, loading: true, label: ""};
    this.toggleNewsDrawer = this.toggleNewsDrawer.bind(this);
    this.renderNews = this.renderNews.bind(this);
  }

  openNews(date, position, label) {
    this.setState(update(this.state, {$merge:
      {newsDrawerVisible: true, loading: true, label: label}
    }));
    axios.get('daily_cat/' + date + '/' + position + ".json")
    .then(res => {
      this.setState(update(this.state, {$merge:
        {loading: false, news: res.data}
      }));
    });
  }

  toggleNewsDrawer(visible) {
    this.setState(update(this.state, {$merge:
      {newsDrawerVisible: visible}
    }));
  }

  renderNews() {
    const news = this.state.news;
    var newsList = news.map((news, i) => {
      return (
            <Paper key={"news" + i} zDepth={1} className="md-grid md-cell md-cell--4" style={{overflow: "hidden"}} >
              <div className="md-cell md-cell--12">
                <Button primary label={news.title} onClick={() => window.location = news.url} />
              </div>
              <div className="md-cell md-cell--12">
                <img src={news.urlToImage} role="presentation" style={{width: "100%"}} />
              </div>
              <div className="md-cell md-cell--12">
                {news.description}
              </div>
            </Paper>
        );
    });
    newsList = [ <div className="md-grid"> {newsList} </div> ]
    newsList.push(<Divider key="div" />);
    newsList.push(<Button key="poweredby"
               href="https://newsapi.org"
               flat
               primary
               style={{float: "right"}}
               label="Powered by newsapi.org" /> );
    return newsList;
  }

  render() {
    const content = this.state.loading
      ? []
      : this.renderNews()

    return (
       <Drawer
         visible={this.state.newsDrawerVisible}
         position="right"
         closeOnNavItemClick={false}
         navItems={content}
         onVisibilityToggle={this.toggleNewsDrawer}
         type={Drawer.DrawerTypes.TEMPORARY}
         style={{ zIndex: 100, background: "url('news-bg.png')" }}
         header={
             <Toolbar
               title={ <span style={{fontSize: "15px", whiteSpace: "normal", color: "white", textShadow: "1px 1px 2px #000000" }}> {this.state.label} </span> }
               actions={<Button icon onClick={() => this.toggleNewsDrawer(false)} iconClassName="fa fa-close fa-lg" />}
               className="md-divider-border md-divider-border--bottom"
             /> }
         >
          { this.state.loading
            ? <LinearProgress id="newsLoader" key="newsLoader" />
            : ""  }
        </Drawer>
       );
  }
}

class MoreActions extends Component {
  constructor(props) {
    super(props);
    this.state = {visible: false};
  }

  toggleDialog(visible) {
    this.setState({visible: visible});
  }

  render() {
    const item = this.props.item
    return (
      <Button
           icon
           iconClassName="fa fa-ellipsis-h"
           className="menu-example"
           onClick={() => this.toggleDialog(true)}>
       <Dialog
         id={"moreActions" + item.position}
         title={item.label}
         onHide={() => this.toggleDialog(false)}
         visible={this.state.visible} >
         <List>
           <img src={item.thumbnail} alt={item.label} style={{width: "66%"}} />
           <ListItem
             leftIcon={<FontIcon
               iconClassName="fa fa-wikipedia-w"/>}
               primaryText="Open Wikipedia"
               onClick={() => window.location = "https://" + item.lang + ".wikipedia.org/wiki/Special:Search?search=" + item.label} />
           <ListItem
             leftIcon={<FontIcon
               iconClassName="fa fa-google"/>}
             primaryText="Search Google News"
             onClick={() => window.location = "https://google.com/search?tbm=nws&q=" + item.label}/>
           <ListItem
             leftIcon={<FontIcon
               iconClassName="fa fa-youtube"/>}
             primaryText="Search YouTube"
             onClick={() => window.location = "https://www.youtube.com/results?q=" + item.label} />
           <ListItem
             leftIcon={<FontIcon
               iconClassName="fa fa-twitter"/>}
             primaryText="Search Twitter"
             onClick={() => window.location = "https://twitter.com/search?q=" + item.label} />
           </List>
         </Dialog>
       </Button>
    );
   }
}

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
         <MoreActions item={item}/>
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
