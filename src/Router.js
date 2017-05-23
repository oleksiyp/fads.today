import update from 'react-addons-update';
import moment from 'moment';
import Route from 'route-parser'

export default class Router {
  constructor() {
    this.newsRoute = new Route("/day/:date/news/:newsPosition/:newsTitle");
    this.moreActionsRoute = new Route("/day/:date/more-actions/:moreActionsPosition/:moreActionsTitle");
    this.dayRoute = new Route("/day/:date");
    this.dateFmt = 'YYYY-MM-DD';
  }

  format(state, key, fmtFunc) {
    if (key in state) {
      const val = fmtFunc(state[key])
      const obj = {}
      obj[key] = val;
      return update(state, {$merge: obj});
    }
    return state;
  }

  formatDate(state) {
    return this.format(state, "date", (date) => moment(date).format(this.dateFmt))
  }

  formatNewsPosition(state) {
    return this.format(state, "newsPosition", (position) => position.toString())
  }

  formatMoreActionsPosition(state) {
    return this.format(state, "moreActionsPosition", (position) => position.toString())
  }

  formatLocation(state) {
    if (state.newsOpened) {
      console.log(state);
      return this.newsRoute.reverse(this.formatNewsPosition(this.formatDate(state)));
    } else if (state.moreActionsOpened) {
      return this.moreActionsRoute.reverse(this.formatMoreActionsPosition(this.formatDate(state)));
    } else {
      return this.dayRoute.reverse(this.formatDate(state));
    }
  }

  applyModifiers(state, append) {
    state = update(state, {$merge: {newsOpened: false, moreActionsOpened: false}})
    state = update(state, {$merge: append})
    return state;
  }

  parseDate(state, append) {
    const dateObj = moment(state.date, this.dateFmt)
    return update(state, {$merge: {date: dateObj.toDate()}});
  }

  parseLocation(location) {
    var state;

    state = this.newsRoute.match(location)
    if (state) {
      return this.parseDate(this.applyModifiers(state, {newsOpened: true}));
    }

    state = this.moreActionsRoute.match(location)
    if (state) {
      return this.parseDate(this.applyModifiers(state, {moreActionsOpened: true}));
    }

    state = this.dayRoute.match(location)
    if (state) {
      return this.parseDate(this.applyModifiers(state, {}));
    }

    return this.applyModifiers({}, {date: new Date()});
  }
}
