import React, { Component } from 'react';
import FontIcon from 'react-md/lib/FontIcons';
import List from 'react-md/lib/Lists/List';
import ListItem from 'react-md/lib/Lists/ListItem';
import Dialog from 'react-md/lib/Dialogs';
import Button from 'react-md/lib/Buttons/Button';

export default class MoreActionsPanel extends Component {
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
