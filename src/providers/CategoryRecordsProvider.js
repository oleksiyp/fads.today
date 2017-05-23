import { Component } from 'react';
import update from 'react-addons-update';
import moment from 'moment';
import axios from 'axios';

export default class CategoryRecordsProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {hasLimits: false, limits: {min: null, max: null}};
  }

  categoryRecordsUrl(date) {
    return 'daily_cat/' + date + '.json'
  }

  limitsUrl() {
    return 'daily_cat/limits.json'
  }

  componentDidMount() {
    this.loadLimits()
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps.date);
  }

  loadLimits() {
    axios.get(this.limitsUrl())
      .then(res => {
        const parseDate = (str) => moment(str, "YYYYMMDD").toDate();
        const limits = {min: parseDate(res.data.min), max: parseDate(res.data.max)}
        const stateUpdate = {hasLimits: true, limits: limits}
        this.setState((state) => update(state, {$merge: stateUpdate}));
        this.props.onLimitsLoaded(stateUpdate)
        this.loadData(this.props.date);
      });
  }

  loadData(dateObj) {
    if (!this.state.hasLimits) {
      return;
    }

    const date = moment(dateObj)
    if (moment(this.state.limits.min).isAfter(date) || date.isAfter(moment(this.state.limits.max))) {
      return;
    }

    if (this.state && this.state['date'] &&  moment(this.state.date).isSame(date)) {
      return;
    }
    this.setState((state) => update(state, {$merge: {date: dateObj}}));

    const dateStr = moment(dateObj).format("YYYYMMDD");
    this.props.onLoad({loading: true, date: dateObj, data: null})
    axios.get(this.categoryRecordsUrl(dateStr))
    .then(res => {
        this.props.onLoad({loading: false, date: dateObj, data: res.data})
    });
  }

  render() {
    return null;
  }
}
