import './App.scss';
import './md-icons.css';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss'

import Router from './Router.js';
import DateNavigator from './DateNavigator.js';
import NewsSidePanel from './NewsSidePanel.js';
import CategoriesView from './CategoriesView.js';
import MoreActionsPanel from './MoreActionsPanel.js';

import CategoryRecordsProvider from './providers/CategoryRecordsProvider.js';

import React, { Component } from 'react';
import Toolbar from 'react-md/lib/Toolbars';
import Helmet from 'react-helmet';
import update from 'react-addons-update';
import moment from 'moment';
import Button from 'react-md/lib/Buttons/Button';
import LinearProgress from 'react-md/lib/Progress/LinearProgress';
import Swipeable from 'react-swipeable'

export default class App extends Component {
  constructor(props) {
    super(props);
    this.dateChanged = this.dateChanged.bind(this);
    this.swippedLeft = this.swippedLeft.bind(this);
    this.swippedRight = this.swippedRight.bind(this);
    this.newsButtonClicked = this.newsButtonClicked.bind(this);
    this.closeNewsSidePanel = this.closeNewsSidePanel.bind(this);
    this.categoryLimitsLoaded = this.categoryLimitsLoaded.bind(this);
    this.categoryDataLoaded = this.categoryDataLoaded.bind(this);
    this.moreActionsClicked = this.moreActionsClicked.bind(this);
    this.closeMoreActionsPanel = this.closeMoreActionsPanel.bind(this);

    this.router = new Router();
    this.state = {
      newsOpened: false,
      moreActionsOpened: false,
      categoryDataLoading: true,
      limits: null
    }
  }

  componentDidMount() {
    this.setState(this.router.parseLocation(this.props.location));
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.router.parseLocation(nextProps.location));
  }

  navigate(stateUpdate) {
    this.setState((state) => update(state, {$merge: stateUpdate}));
    history.pushState(null,null, '#' + this.router.formatLocation(stateUpdate));
    window.ga('set', 'page', location.pathname+location.search+location.hash);
    window.ga('send', 'pageview');
  }

  dateChanged(dateObj) {
    if (!this.state.hasLimits) {
      return;
    }

    const dateMax = moment.max(moment(dateObj), moment(this.state.limits.min));
    const dateMinMax = moment.min(dateMax, moment(this.state.limits.max));

    if (moment(this.state.date).isSame(moment(dateMinMax))) {
      return;
    }

    this.navigate({
      date: dateMinMax.toDate(),
      newsOpened: false,
      moreActionsOpened: false
    });
  }

  categoryLimitsLoaded(stateUpdate) {
    this.setState(update(this.state, {$merge: stateUpdate}));
    this.dateChanged(this.state.date);
  }

  categoryDataLoaded(e) {
    this.setState((state) => update(state, {$merge: {
        categoryDataLoading: e.loading,
        categoryData: e.data,
        categoryDataDate: e.date
      }
    }));
    if (e.data && this.state.moreActionsOpened && this.state['moreActionsPosition']) {
      var rec = null
      for (var cat of e.data) {
        for (var record of cat.records) {
          if (record.position === parseInt(this.state.moreActionsPosition, 10)) {
            rec = record;
            break;
          }
        }
      }
      this.setState((state) => update(state, {$merge: {
        moreActionsItem: rec
      }}))
    }
  }

  newsButtonClicked(record) {
    this.navigate({
      newsOpened: true,
      date: this.state.date,
      newsPosition: record.position,
      newsTitle: record.label,
    });
  }

  moreActionsClicked(record) {
    this.navigate({
      moreActionsOpened: true,
      date: this.state.date,
      moreActionsPosition: record.position,
      moreActionsTitle: record.label,
      moreActionsItem: record
    });
  }

  closeNewsSidePanel() {
    if (this.state.newsOpened) {
      history.back();
    }
  }

  closeMoreActionsPanel() {
    if (this.state.moreActionsOpened) {
      history.back();
    }
  }

  swippedLeft(e) {
    this.refs.dateNav.forwardButton();
  }

  swippedRight(e) {
    this.refs.dateNav.backButton();
  }

  render() {
    return (
      <div>
        <Helmet title="fads today" />
        <Toolbar
          colored
          title={<div style={{fontSize: "17px", overflow: "hidden"}}> {"What's happening on " + moment(this.state.date).format("DD MMM YYYY")} </div>}
          style={{background: "url('toolbar-bg.jpg')", fontSize: "18px"}}
         />

       <Swipeable
         onSwipedLeft={this.swippedLeft}
         onSwipedRight={this.swippedRight}
         delta={25}
         flickThreshold={0.7}
         preventDefaultTouchmoveEvent={true} >

          <div className="md-grid">
            <DateNavigator ref="dateNav"
              date={this.state.date}
              limits={this.state.limits}
              onChange={this.dateChanged} />
          </div>

          <CategoryRecordsProvider
            date={this.state.date}
            onLoad={this.categoryDataLoaded}
            onLimitsLoaded={this.categoryLimitsLoaded} />

          {
            this.state.categoryDataLoading
            ? <LinearProgress id="itemLoader" />
            : <CategoriesView
                categoryData={this.state.categoryData}
                onNewsButtonClicked={this.newsButtonClicked}
                onMoreActionsClicked={this.moreActionsClicked} />
          }
        </Swipeable>

        <NewsSidePanel
            opened={this.state.newsOpened}
            date={this.state.date}
            position={this.state.newsPosition}
            title={this.state.newsTitle}
            onVisibilityToggle={this.closeNewsSidePanel}/>

        <MoreActionsPanel
            opened={this.state.moreActionsOpened && !!this.state['moreActionsItem']}
            item={this.state.moreActionsItem}
            onVisibilityToggle={this.closeMoreActionsPanel} />

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
