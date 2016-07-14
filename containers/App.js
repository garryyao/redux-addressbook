import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import AddressBook from '../components/AddressBook'
import * as AddressActions from '../actions'
import GMapAPI from 'load-google-maps-api'

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {apiReady: false};
  }
  
  render() {
    const {list, actions, messages} = this.props
    return this.state.apiReady ? <AddressBook addressList={list} messages={messages} actions={actions}/> : null;
  }
  
  componentDidMount() {
    // Load Google APIs
    GMapAPI({
      key: 'AIzaSyBa-MYkOBGM_UNV2FT_-HY61KQg5kL8rLc',
      libraries: ['places'],
      timeout: 15000
    }).then((googleMaps) => {
      this.setState({apiReady: true});
    });
  }
}

App.propTypes = {
  list: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    list: state.addresses,
    messages: state.notifications
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(AddressActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
