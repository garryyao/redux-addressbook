import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import linkState from 'react-link-state';
import _ from 'lodash';

const AddressComponentsType = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};
const ESC = 'Escape';
const ENTER = 'Enter';

class AddressInput extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }
  
  render() {
    return (
      <form ref="form" action="javascript:void(0)" onSubmit={this.handleSubmit.bind(this)}
            onKeyUp={this.handleKeyUp.bind(this)}>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--12-col">
          <input className="mdl-textfield__input mdl-textfield__input--lg"
                 type="text"
                 id="address-input"
                 ref="autocomplete"
                 autoFocus="true"/>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--4-col">
          <input className="mdl-textfield__input" type="text" id="street" valueLink={linkState(this, 'street_number')}/>
          <label className="mdl-textfield__label" htmlFor="street">Street Number...</label>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--8-col">
          <input className="mdl-textfield__input" type="text" id="route" valueLink={linkState(this, 'route')}/>
          <label className="mdl-textfield__label" htmlFor="route">Route...</label>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--4-col">
          <input className="mdl-textfield__input" type="text" id="city" valueLink={linkState(this, 'locality')}/>
          <label className="mdl-textfield__label" htmlFor="city">City...</label>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--4-col">
          <input className="mdl-textfield__input" type="text" id="state"
                 valueLink={linkState(this, 'administrative_area_level_1')}/>
          <label className="mdl-textfield__label" htmlFor="state">State...</label>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--4-col">
          <input className="mdl-textfield__input" type="text" id="zipcode"
                 valueLink={linkState(this, 'postal_code')}/>
          <label className="mdl-textfield__label" htmlFor="zipcode">Zip Code...</label>
        </div>
        <div className="mdl-textfield mdl-js-textfield mdl-cell mdl-cell--12-col">
          <input className="mdl-textfield__input" type="text" id="country" valueLink={linkState(this, 'country')}/>
          <label className="mdl-textfield__label" htmlFor="country">Country...</label>
        </div>
        <div className="mdl-dialog__actions">
          <button type="submit" className="mdl-button mdl-js-button mdl-js-ripple-effect">Done
          </button>
        </div>
      </form>
    )
  }
  
  componentDidMount() {
    // Upgrade material components in DOM
    window.componentHandler.upgradeAllRegistered();
    
    var address_input = this.refs.autocomplete;
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    const autocomplete = new google.maps.places.Autocomplete((address_input), {types: ['geocode']});
    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', () => {
      
      // Get the place details from the auto-complete object and to update state
      const place = autocomplete.getPlace();
      if (place.place_id) {
        const location = place.geometry.location;
        let address = place.address_components.reduce((address, component) => {
          var type = component.types[0];
          if (AddressComponentsType[type]) {
            address[type] = component[AddressComponentsType[type]];
          }
          return address;
        }, {});
        
        // Copy rest of interested properties
        _.assign(address, _.pick(place, ['place_id', 'formatted_address']));
        
        // Convert to serializable geometry location
        address.geolocation = {lat: location.lat(), lng: location.lng()}
        
        this.setState(address);
      }
    });
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.toggle !== this.props.toggle ||
        prevProps.address !== this.props.address) {
      this.refs.autocomplete.focus();
    }
    
    Array.from(this.refs.form.querySelectorAll('.mdl-js-textfield')).forEach(($el)=> {
      if ($el.MaterialTextfield) {
        $el.MaterialTextfield.checkDirty();
      }
    });
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.toggle !== this.props.toggle) {
      this.reset();
    }
    
    if (nextProps.address) {
      this.setState(_.assign(this.state, nextProps.address, {place_id: ''}));
    }
  }
  
  handleSubmit(e) {
    // Stop form submission in auto complete
    if (document.activeElement === this.refs.autocomplete) {
      return false;
    }
    
    // Make sure there's an valid address
    if (this.state.place_id) {
      this.props.onSave(this.state);
    }
  }
  
  handleKeyUp(e) {
    if (e.key === ESC) {
      this.props.onClose();
    }
  }
  
  reset() {
    this.state = {};
    this.refs.form.reset();
    this.forceUpdate();
  }
}

AddressInput.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  address: PropTypes.object,
  toggle: PropTypes.bool
}

export default AddressInput
