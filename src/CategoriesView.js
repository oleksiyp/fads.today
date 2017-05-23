import React, { Component } from 'react';
import Paper from 'react-md/lib/Papers';
import Card from './Card.js';

export default class CategoriesView extends Component {
  constructor(props) {
    super(props);
    this.renderCategory = this.renderCategory.bind(this);
  }

  renderCategory(cat, i) {
    var cnt = 1;
    const self = this;
    const recordPapers = cat.records.map((record, j) => {
      return (
        <Card
          key={"card" + cnt++}
          item={record}
          onNewsButtonClicked={() => self.props.onNewsButtonClicked(record)}
          onMoreActionsClicked={() => self.props.onMoreActionsClicked(record)}  />)
    });

    return (
    <div key={"card" + i} className="md-grid" style={{overflow: "hidden" }}>
    {cat.category === ""
      ? recordPapers
      : <Paper zDepth={3} className="md-grid md-cell md-cell--12" style={{overflow: "hidden", background: "url('cubicon.png')", backgroundSize: "35pt 20pt", backgroundColor: "#cc3344"}} >
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
    }
    </div> )
  }

  render()  {
    return <div> {this.props.categoryData.map(this.renderCategory)} </div>;
  }
}
