import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'emotion'
import tokens from '@contentful/forma-36-tokens'
import { Form, Button, Modal, Subheading, TextField } from '@contentful/forma-36-react-components'

export default class CrossSpaceConfigDialog extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    const { parameters } = props.sdk

    const identifier = (parameters.invocation.entry && parameters.invocation.entry.identifier) || ''
    const spaceId = (parameters.invocation.entry && parameters.invocation.entry.spaceId) || ''
    const deliveryToken = (parameters.invocation.entry && parameters.invocation.entry.deliveryToken) || ''
    const saved = (parameters.invocation.entry && parameters.invocation.entry.saved) || false

    this.state = {
      identifier,
      spaceId,
      deliveryToken,
      saved
    }

    this.onClose = this.onClose.bind(this)
    this.onSave = this.onSave.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  isNew() {
    const { identifier, spaceId, deliveryToken } = this.state
    return !(identifier && spaceId && deliveryToken)
  }

  onSave() {
    this.props.sdk.close(this.state)
  }

  onClose() {
    this.props.sdk.close(this.props.config)
  }

  handleChange({ target }) {
    let state = {...this.state}
    state[target.id] = target.value
    this.setState(state)
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer()
  }

  render() {
    return (
      <>
        <Modal.Content>
          <Form>
            <TextField
              required
              name="identifier"
              id="identifier"
              labelText="Space Name"
              helpText="Enter your Space name"
              value={this.state.identifier}
              onChange={this.handleChange}
            />
            <TextField
              required
              name="spaceId"
              id="spaceId"
              labelText="Space ID"
              helpText="Enter your Space ID"
              value={this.state.spaceId}
              onChange={this.handleChange}
            />
            <TextField
              required
              name="deliveryToken"
              id="deliveryToken"
              labelText="Delivery token"
              helpText="Enter your delivery token "
              value={this.state.deliveryToken}
              onChange={this.handleChange}
            />
          </Form>
        </Modal.Content>
        <Modal.Controls>
          <Button onClick={() => this.onSave(this.state)} buttonType="positive">
            Save
          </Button>
          <Button onClick={this.onClose} buttonType="muted">
            Close
          </Button>
        </Modal.Controls>
      </>
    )
  }
}
