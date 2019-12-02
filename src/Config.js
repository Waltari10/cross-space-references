import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'emotion'
import tokens from '@contentful/forma-36-tokens'
import {
         Form, Button,
         Heading, Subheading, Paragraph, EntityList,
         EntityListItem, DropdownList, DropdownListItem
       } from '@contentful/forma-36-react-components'

const findEntryIndex = (entryList, entry) => {
  let index = -1
  for (let i = 0; i < entryList.length; i++) {
    let otherEntry = entryList[i]

    if (entry.spaceId === otherEntry.spaceId) {
      index = i
      break
    }
  }

  return index
}

const styles = {
  paragraph: css({
    marginBottom: tokens.spacingL
  }),
  button: css({
    marginBottom: tokens.spacingXl
  }),
  entry: css({
    figure: css({
      display: 'none'
    })
  }),
  form: css({
    width: tokens.contentWidthText,
    padding: tokens.spacingL,
    boxShadow: tokens.boxShadowHeavy,
    margin: tokens.spacing2Xl,
    align: 'center'
  })
}

export default class Config extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      crossSpaceConfigurations: []
    }

    this.app = props.sdk.platformAlpha.app

    this.editEntry = this.editEntry.bind(this)
    this.removeEntry = this.removeEntry.bind(this)
    this.addSpaceConfiguration = this.addSpaceConfiguration.bind(this)
    this.onConfigure = this.onConfigure.bind(this)
    this.app.onConfigure(() => this.onConfigure());
  }

  async removeEntry(entry) {
    const crossSpaceConfigurations = [...this.state.crossSpaceConfigurations]

    const index = findEntryIndex(crossSpaceConfigurations, entry)
    if (index !== -1) {
      crossSpaceConfigurations.splice(index, 1)
      this.setState({crossSpaceConfigurations})
    }
  }

  validConfig(entry) {
    const { identifier, spaceId, deliveryToken } = (entry || {})
    return identifier && spaceId && deliveryToken
  }

  async editEntry(entry) {
    const updatedEntry = await this.props.sdk.dialogs.openExtension({
      id: 'cross-space-references',
      position: 'center',
      title: 'Edit Space Configuration',
      parameters: {entry}
    })
    if (!this.validConfig(updatedEntry)) return

    let crossSpaceConfigurations = [...this.state.crossSpaceConfigurations]

    const index = findEntryIndex(crossSpaceConfigurations, entry)
    if (index !== -1) {
      crossSpaceConfigurations[index] = updatedEntry
    }

    this.setState({ crossSpaceConfigurations })
  }

  async addSpaceConfiguration({ entry }) {
    const config = await this.props.sdk.dialogs.openExtension({
      id: 'cross-space-references',
      position: 'center',
      title: 'Add Space Configuration',
      parameters: {entry}
    })
    if (!this.validConfig(config)) return

    this.setState({crossSpaceConfigurations: [...this.state.crossSpaceConfigurations, config]})
  }

  onConfigure() {
    if (this.state.crossSpaceConfigurations.length === 0) {
      return false
    }

    let crossSpaceConfigurations = this.state.crossSpaceConfigurations.map(config => {
      config.saved = true
      return config
    })

    this.setState({crossSpaceConfigurations})
    return { parameters: { crossSpaceConfigurations } }
  }

  async componentDidMount() {
    let crossSpaceConfigurations = []

    try {
      const parameters = await this.app.getParameters()
      crossSpaceConfigurations = ((parameters || {}).crossSpaceConfigurations || [])
    } catch {
      // doesn't exist - therefore it's not installed
    }

    this.setState({crossSpaceConfigurations}, this.app.setReady)
  }

  render() {
    return (
      <Form className={styles.form} id="app-config">
        <Heading>About Cross-space references</Heading>
        <Paragraph className={styles.paragraph}>
          The Cross-space references app allows you to search and select entries from your other spaces,
          then references the entries within a single space. This enables you to access content from across all of your organizations.
          The cross-space references app aims to help you create consistent content efficiently.
        </Paragraph>

        <hr />

        <Heading>Space configuration</Heading>
        <Paragraph className={styles.paragraph}>
          Here you can add more cross-space configurations. They will be used to save the configuration required for
          linking and using cross-space references in the app.
        </Paragraph>

        <div className={styles.button}>
          <Button onClick={this.addSpaceConfiguration}>Add Space Configuration</Button>
        </div>

          { this.state.crossSpaceConfigurations && this.state.crossSpaceConfigurations.length > 0 && (
          <>
            <Subheading>All Space Configurations</Subheading>
            <EntityList>
              { this.state.crossSpaceConfigurations.map((e, i) => {
                return (
                  <EntityListItem
                    key={i}
                    className={styles.entry}
                    title={e.identifier}
                    status={ (e.saved) ? "published" : "draft" }
                    contentType="Cross Space Configuration"
                    description={e.spaceId}
                    dropdownListElements={(
                      <DropdownList>
                        <DropdownListItem onClick={async () => await this.editEntry(e)}>Edit</DropdownListItem>
                        <DropdownListItem onClick={async () => await this.removeEntry(e)}>Remove</DropdownListItem>
                      </DropdownList>
                    )}
                  />
                )
              })}
            </EntityList>
          </>
        )}
      </Form>
    )
  }
}
