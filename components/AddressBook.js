import React, {Component, PropTypes} from 'react'
import AddressEntry from './AddressEntry'
import AddressInput from './AddressInput'
import store from '../store'
import _ from 'lodash';
import classnames from 'classnames'
import contains from 'contains'
import GMapAPI from 'load-google-maps-api'

const MAP_MAX_ZOOM = 10;
const US = {lat: 37.09024, lng: -95.712891};

const SPINNER = <div className="mdl-spinner mdl-js-spinner is-active"></div>;
class AddressBook extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      mapReady: false,
      editingAddress: null,
      editorOpened: false
    };
    
    this.mapMarkers = [];
    
    this.handleClickOutside = (e) => {
      if (this.state.editorOpened) {
        if (!contains(this.refs.list, e.target)) {
          this.cancelEditing();
        }
      }
    };
    
    this.displayNotification = _.throttle(message => {
      this.refs.snackbar.MaterialSnackbar.showSnackbar(message);
    });
  }
  
  render() {
    const {addressList, actions} = this.props;
    const {editorOpened, editingAddress, mapReady} = this.state;
    
    return (
      <section className="mdl-address-app">
        {mapReady ? <div ref="list" className="mdl-address-list">
          <dialog className={classnames('mdl-dialog', 'mdl-dialog-address', { 'mdl-dialog-opened': editorOpened})}>
            <div className="mdl-dialog__content mdl-grid">
              <AddressInput ref="editor"
                            toggle={editorOpened}
                            address={editingAddress}
                            onSave={this.handleSave.bind(this)}
                            onClose={this.cancelEditing.bind(this)}
              />
            </div>
          </dialog>
          <div className="mdl-card mdl-card-address-list md-card-mdl-shadow--2dp">
            <div className="mdl-card__title">
              <h2 className="mdl-card__title-text">Your Addresses</h2>
            </div>
            <div className="mdl-card__menu">
              <button className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                      onClick={this.handleNewAddress.bind(this)}>
                <i className="material-icons">add_location</i>
              </button>
            </div>
            <ul className="mdl-list">
              {addressList.length ? addressList.map(address =>
                                                      <AddressEntry key={address.id}
                                                                    address={address}
                                                                    isEditing={editingAddress && address.id === editingAddress.id}
                                                                    onEdit={this.handleEditAddress.bind(this)}
                                                                    onDelete={this.handleDeleteAddress.bind(this)}
                                                        {...actions} />) :
                 <li className="mdl-list__item mdl-list__item--empty">
                   <label className="mdl-list__item-primary-content">
                     <i className="material-icons mdl-list__item-avatar">pin_drop</i>
                     <i>You don't have yet any address, go ahead <a href="javascript:void(0)"
                                                                    onClick={this.handleNewAddress.bind(this)}>add
                       one</a>.</i>
                   </label>
                 </li>
              }
            </ul>
          
          </div>
        </div> : SPINNER}
        <div ref="map" className="mdl-map"></div>
        <div ref="snackbar" className="mdl-js-snackbar mdl-snackbar">
          <div className="mdl-snackbar__text"></div>
          <button className="mdl-snackbar__action" type="button">Dismiss</button>
        </div>
      </section>
    )
  }
  
  handleSave(address) {
    this.setState({editorOpened: false});
    const {actions} = this.props;
    if (typeof address.id === 'number') {
      actions.editAddr(address.id, address);
      this.cancelEditing();
    } else {
      actions.newAddr(address);
    }
  }
  
  cancelEditing(keepEditor = false) {
    this.refs.editor.reset();
    this.setState({editingAddress: null, editorOpened: keepEditor});
  }
  
  handleEditAddress(address) {
    this.setState({editingAddress: address, editorOpened: true});
  }
  
  handleDeleteAddress(id) {
    const {actions} = this.props;
    this.cancelEditing();
    actions.deleteAddr(id);
  }
  
  handleNewAddress() {
    if (this.state.editingAddress) {
      this.cancelEditing(true);
    } else {
      this.setState({editorOpened: !this.state.editorOpened});
    }
  }
  
  componentDidMount() {
    // Upgrade material components in DOM
    window.componentHandler.upgradeAllRegistered();
    document.addEventListener('click', this.handleClickOutside);
    this.mountMap();
    this.fetchAddresses();
    this.subscribeToSync();
  }
  
  fetchAddresses() {
    const {actions} = this.props
    // Load list of addresses
    actions.fetchAddrs();
  }
  
  // Sync up address list with server api
  subscribeToSync() {
    const {actions} = this.props;
    let prevAddresses;
    store.subscribe(function() {
      const newAddresses = store.getState().addresses;
      if (newAddresses !== prevAddresses) {
        if (prevAddresses) {
          actions.updateAddrs(newAddresses, prevAddresses);
        }
        prevAddresses = newAddresses;
      }
    });
  }
  
  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
  
  mountMap() {
    const renderMap = center => {
      this.map = new google.maps.Map(this.refs.map, {
        center: center,
        zoom: MAP_MAX_ZOOM,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      google.maps.event.addListener(this.map, 'tilesloaded', _.once(()=> {
        this.updateMarkers();
      }));
      this.setState({mapReady: true});
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function onSuccess(position) {
        renderMap({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, function onError() {
        renderMap(US);
      });
    }
    renderMap(US);
  }
  
  updateMarkers() {
    const map = this.map;
    
    // Clear obsoleted map markers
    if (this.mapMarkers.length) {
      this.mapMarkers.forEach(marker => {
        marker.setMap(null);
      })
    }
    
    const bounds = new google.maps.LatLngBounds();
    
    const markers = this.props.addressList.map((address, index) => {
      const loc = new google.maps.LatLng(address.geolocation);
      const marker = new google.maps.Marker({
        position: loc,
        map: map,
        label: (index + 1).toString()
      });
      bounds.extend(loc);
      return marker;
    });
    
    if (markers.length) {
      this.mapMarkers = markers;
      map.fitBounds(bounds);
      if (map.getZoom() > MAP_MAX_ZOOM) {
        map.setZoom(MAP_MAX_ZOOM);
      }
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    // Address list changed update markers on the map
    if (this.map && this.props.addressList !== prevProps.addressList) {
      this.updateMarkers();
    }
    
    // Notify address updates
    if (this.props.messages !== prevProps.messages) {
      this.displayNotification({
        timeout: 2000,
        actionText: 'Dismiss',
        message: this.props.messages[0].message
      });
    }
  }
}

AddressBook.propTypes = {
  addressList: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

export default AddressBook
