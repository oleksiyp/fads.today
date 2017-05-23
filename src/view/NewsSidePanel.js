import React, { Component } from 'react';
import Paper from 'react-md/lib/Papers';
import Button from 'react-md/lib/Buttons/Button';
import Divider from 'react-md/lib/Dividers';
import Drawer from 'react-md/lib/Drawers';
import Toolbar from 'react-md/lib/Toolbars';
import LinearProgress from 'react-md/lib/Progress/LinearProgress';
import axios from 'axios';
import moment from 'moment';
import update from 'react-addons-update';

export default class NewsSidePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: true};
    this.renderNews = this.renderNews.bind(this);
  }

  componentDidMount() {
    const {date, position, title} = this.props;
    this.openNews(date, position, title);
  }

  componentWillReceiveProps(nextProps) {
    const {date, position, title} = nextProps;
    this.openNews(date, position, title);
  }

  openNews(date, position, label) {
    if (!date) {
      return;
    }
    const dataUrl = 'daily_cat/' + moment(date).format("YYYYMMDD") + '/' + position + ".json"
    if (this.state['dataUrl'] && this.state.dataUrl === dataUrl) {
      return;
    }
    this.setState(update(this.state, {$merge:
      {loading: true, dataUrl: dataUrl}
    }));
    axios.get(dataUrl)
    .then(res => {
      this.setState(update(this.state, {$merge:
        {loading: false, news: res.data}
      }));
    });
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
    newsList = [ <div key="news" className="md-grid"> {newsList} </div> ]
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
         visible={this.props.opened}
         position="right"
         closeOnNavItemClick={false}
         navItems={content}
         onVisibilityToggle={this.props.onVisibilityToggle}
         type={Drawer.DrawerTypes.TEMPORARY}
         style={{ zIndex: 100, background: "url('news-bg.png')" }}
         header={
             <Toolbar
               key="toolbar"
               title={ <span style={{fontSize: "15px", whiteSpace: "normal", color: "white", textShadow: "1px 1px 2px #000000" }}> {this.props.title} </span> }
               actions={<Button icon onClick={() => this.props.onVisibilityToggle(false)} iconClassName="fa fa-close fa-lg" />}
               className="md-divider-border md-divider-border--bottom"
             /> }
         >
          { this.state.loading
            ? <LinearProgress id="newsLoader" key="newsLoader" />
            : null  }
        </Drawer>
       );
  }
}
