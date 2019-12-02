import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Card, Subheading, Spinner, IconButton, FormLabel, TextInput } from '@contentful/forma-36-react-components'
import EntryList from './EntryList'
import { debounce } from 'lodash'
import { css } from 'emotion'

const styles = {
  subheading: css({
    display: 'flex',
    alignItems: 'center'
  }),
  closeButton: css({
    marginLeft: 'auto'
  })
}

export default class EntryPicker extends React.Component {
  static propTypes = {
    onSelectEntry: PropTypes.func.isRequired,
    onOpenEntry: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    sdks: PropTypes.array.isRequired,
    sdk: PropTypes.shape({
      window: PropTypes.shape({
        startAutoResizer: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      spaceSdk: null,
      contentType: null,
      entries: [],
      contentTypes: [],
      searchTerm: '',
      loading: false
    }

    this.selectSpaceSdk = this.selectSpaceSdk.bind(this)
    this.selectContentType = this.selectContentType.bind(this)
    this.debouncedAddSearchTerm = debounce(this.addSearchTerm.bind(this), 300, {trailing: true})
    this.addSearchTerm = (e) => e.persist() || this.debouncedAddSearchTerm(e)
  }

  componentDidMount() {
    const { sdk } = this.props
    sdk.window.startAutoResizer()
  }

  async buildEntry(actualEntry, spaceSdk) {
    const contentType = this.state.contentTypes.find(ct => ct.id === actualEntry.sys.contentType.sys.id)

    return {
      title: actualEntry.fields[contentType.displayField] || "Untitled",
      contentTypeName: contentType.name,
      spaceId: actualEntry.sys.space.sys.id,
      spaceName: spaceSdk.identifier,
      id: actualEntry.sys.id
    }
  }

  async fetchEntries(spaceSdk, contentTypeId, searchTerm) {
    let query = {content_type: contentTypeId}
    searchTerm = searchTerm || this.state.searchTerm
    if (searchTerm) {
        query['query'] = searchTerm
    }

    const entries = await spaceSdk.delivery.getEntries(query)

    let builtEntries = []
    for (let i = 0; i < entries.items.length; i++) {
      const builtEntry = await this.buildEntry(entries.items[i], spaceSdk)
      try {
        builtEntries.push(builtEntry)
      } catch {
        // explicitly do nothing
      }
    }

    return builtEntries
  }

  async fetchContentTypes(spaceSdk) {
    return (await spaceSdk.delivery.getContentTypes({select: ['name', 'displayField', 'sys.id']})).items.map((ct) => { return {name: ct.name, displayField: ct.displayField, id: ct.sys.id} })
  }

  async selectSpaceSdk({ value }) {
    const spaceSdk = value
    const contentTypes = await this.fetchContentTypes(spaceSdk)

    this.setState({spaceSdk, contentTypes, entries: [], contentType: null, searchTerm: ''})
  }

  async selectContentType(contentTypeOption) {
    const contentType = {name: contentTypeOption.label, id: contentTypeOption.value}
    this.setState({contentType, loading: true, entries: []})

    const entries = await this.fetchEntries(this.state.spaceSdk, contentType.id)

    this.setState({entries, loading: false})
  }

  async addSearchTerm(e) {
    e.persist()
    const target = e.target

    this.setState({searchTerm: target.value, loading: true})

    const { spaceSdk, contentType } = this.state

    const entries = await this.fetchEntries(spaceSdk, contentType.id, target.value)
    this.setState({entries, loading: false})
  }

  render() {
    const { spaceSdk, contentTypes, contentType, entries, loading } = this.state

    const selectedSpaceOption = spaceSdk ? {value: spaceSdk, label: spaceSdk.identifier} : undefined
    const spaceOptions = this.props.sdks.map((sdk) => { return {value: sdk, label: sdk.identifier} })

    const selectedContentType = contentType ? {value: contentType.id, label: contentType.name} : undefined
    const contentTypeOptions = contentTypes.map((ct) => { return {value: ct.id, label: ct.name} })

    return (
      <Card>
        <Subheading className={styles.subheading}>
          Add a reference
          <IconButton className={styles.closeButton} label="Go back" iconProps={{icon: 'Close'}} onClick={this.props.onBack} />
        </Subheading>

        <FormLabel required>Source space</FormLabel>
        <Select options={spaceOptions} selectedOption={selectedSpaceOption} onChange={this.selectSpaceSdk} />
        <br />

        <FormLabel required>Content type</FormLabel>
        <Select options={contentTypeOptions} selectedOption={selectedContentType} onChange={this.selectContentType} />
        <br />

        <FormLabel>Search for entry by keyword</FormLabel>
        <TextInput name="searchTerm" type="text" value={this.state.searchTerm} onChange={this.addSearchTerm} />

        {loading && <main><Spinner /></main>}
        {entries && contentType && !loading && <EntryList entries={this.state.entries} onOpenEntry={this.props.onOpenEntry} onSelectEntry={this.props.onSelectEntry} />}
      </Card>
    )
  }
}
