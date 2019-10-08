import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { Button, Spinner } from '@contentful/forma-36-react-components'
import { init, locations } from 'contentful-ui-extensions-sdk'
import '@contentful/forma-36-react-components/dist/styles.css'
import './index.css'
import { createClient } from 'contentful'
import EntryList from './EntryList'
import EntryPicker from './EntryPicker'

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    const value = props.sdk.field.getValue() || {entries: []}

    this.state = {
      value,
      sdks: [],
      entries: [],
      contentTypes: {},
      loading: true,
      showEntryPicker: false
    }

    this.addEntry = this.addEntry.bind(this)
    this.removeEntry = this.removeEntry.bind(this)
    this.toggleEntryPicker = this.toggleEntryPicker.bind(this)
  }

  buildSdksFor(space) {
    const defaultLocale = this.props.sdk.locales.default

    const spaceId = space.fields.spaceId[defaultLocale]
    const identifier = space.fields.identifier[defaultLocale]
    const deliveryToken = space.fields.deliveryToken[defaultLocale]

    return {
      identifier,
      spaceId,
      delivery: createClient({
        space: spaceId,
        accessToken: deliveryToken
      })
    }
  }

  async buildEntry(entry, initialSdks) {
    const sdks = (initialSdks || this.state.sdks).find(sdk => sdk.spaceId === entry.spaceId)

    const actualEntry = await sdks.delivery.getEntry(entry.id)

    let contentTypeCache = this.state.contentTypes[entry.spaceId] || []

    let contentType = contentTypeCache.find(ct => ct.id === actualEntry.sys.contentType.sys.id)
    if (!contentType) {
      contentType = await sdks.delivery.getContentType(actualEntry.sys.contentType.sys.id)

      let contentTypes = {...this.state.contentTypes}
      contentTypes[`${entry.spaceId}`] = [...contentTypeCache, contentType]
      this.setState({contentTypes})
    }

    return {
      title: actualEntry.fields[contentType.displayField],
      contentTypeName: contentType.name,
      spaceId: entry.spaceId,
      spaceName: sdks.identifier,
      id: entry.id
    }
  }

  async buildEntries(entries, sdks) {
    let builtEntries = []

    for(let i = 0; i < entries.length; i++) {
      const builtEntry = await this.buildEntry(entries[i], sdks)
      try {
        builtEntries.push(builtEntry)
      } catch {
        // explicitly do nothing
      }
    }

    return builtEntries
  }

  async componentDidMount() {
    this.props.sdk.window.startAutoResizer()

    const spaces = await this.props.sdk.space.getEntries({content_type: 'crossSpaceConfiguration'})
    const sdks = spaces.items.map(s => this.buildSdksFor(s))

    const entries = await this.buildEntries([...this.state.value.entries], sdks)

    this.setState({ entries, sdks, loading: false })
  }

  async addEntry(entry) {
    const entries = [...this.state.entries, await this.buildEntry(entry)]

    await this.props.sdk.field.setValue({entries})
    this.setState({entries, value: this.props.sdk.field.getValue(), showEntryPicker: false})
  }

  async removeEntry(entry) {
    const entries = [...this.state.entries]

    let index = -1
    for (let i = 0; i < entries.length; i++) {
      let otherEntry = entries[i]

      if (entry.id === otherEntry.id && entry.spaceId === otherEntry.spaceId) {
        index = i
        break
      }
    }

    if (index !== -1) {
      entries.splice(index, 1)
      await this.props.sdk.field.setValue({entries})
      this.setState({entries})
    }
  }

  openEntry(entry) {
    window.open(`https://app.contentful.com/spaces/${entry.spaceId}/entries/${entry.id}`, '_blank')
  }

  async toggleEntryPicker() {
    this.setState({showEntryPicker: !this.state.showEntryPicker})
  }

  render() {
    const { loading, showEntryPicker, entries } = this.state

    if (loading) return (<main><Spinner /></main>)

    if (showEntryPicker) return (<EntryPicker onBack={this.toggleEntryPicker} onOpenEntry={this.openEntry} onSelectEntry={this.addEntry} sdks={this.state.sdks} sdk={this.props.sdk} />)

    return (
      <>
        <Button icon="PlusCircle" onClick={this.toggleEntryPicker}>Add Entry</Button>
        <EntryList entries={this.state.entries} onOpenEntry={this.openEntry} onRemoveEntry={this.removeEntry} />
        <p><small><i>When opening an entry in a new tab, you may not have the permissions required to view it</i></small></p>
      </>
    )
  }
}

init(sdk => {
  if (sdk.location.is(locations.LOCATION_APP)) {
    return ReactDOM.render(<p>Hi</p>, document.getElementById('root'))
  }
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'))
})

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept()
// }
