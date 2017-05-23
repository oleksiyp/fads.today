import React, { Component } from 'react';
import Button from 'react-md/lib/Buttons/Button';
import Paper from 'react-md/lib/Papers';
import LazyLoad from 'react-lazyload';

export default class Card extends Component {
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
             iconClassName="fa fa-newspaper-o fa-lg" /> : null
         }
         <Button
              icon
              iconClassName="fa fa-ellipsis-h"
              className="menu-example"
              onClick={this.props.onMoreActionsClicked} />
      </Paper>
    );
  }
}
