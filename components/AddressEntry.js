import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'

class AddressEntry extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {};
  }
  
  handleEdit(address) {
    this.props.onEdit(address);
  }
  
  render() {
    const {address, deleteAddr} = this.props;
    return (
      <li className={classnames('mdl-list__item', { 'mdl-list__item--editing': this.props.isEditing })}>
        <label className="mdl-list__item-primary-content" onClick={this.handleEdit.bind(this, address)}>
          <i className="material-icons mdl-list__item-avatar">location_on</i>
          {address.formatted_address}
        </label>
        <button className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                onClick={this.props.onDelete.bind(this, address.id)}>
          <i className="material-icons">delete</i>
        </button>
      </li>
    )
  }
}

AddressEntry.propTypes = {
  address: PropTypes.object.isRequired,
  isEditing: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  deleteAddr: PropTypes.func.isRequired
}

export default AddressEntry
