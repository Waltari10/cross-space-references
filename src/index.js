import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { EntryCard } from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';
import { createClient } from 'contentful';

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);

    const value = JSON.parse(props.sdk.field.getValue() || '[]')
    const spaces = props.sdk.parameters.installation.spaces || []
    const sdks = spaces.map(s => this.buildSdksFor(s))

    this.state = {
      value,
      spaces,
      sdks,
      entries: []
    };
  }

  buildSdksFor(space) {
    const spaceId = space.id
    const previewToken = space.previewToken
    const deliveryToken = space.deliveryToken

    return {
      spaceId,
      delivery: createClient({
        space: spaceId,
        accessToken: deliveryToken
      }),
      preview: createClient({
        space: spaceId,
        accessToken: previewToken,
        host: "preview.contentful.com"
      })
    }
  }

  spaceFor(entry, spaces) {
    return spaces.find(s => s.id === entry.spaceId)
  }

  async getPublishedState(actualPreviewEntry, sdks) {
    try {
      const actualDeliveryEntry = await sdks.delivery.entry(actualPreviewEntry.sys.id)

      if (actualPreviewEntry.sys.updatedAt >= actualDeliveryEntry.sys.updatedAt) {
        return "Updated"
      }
      return "Published"
    } catch {
      return "Draft"
    }
  }

  async buildEntry(entry, spaces) {
    const space = this.spaceFor(entry, spaces)
    const sdks = this.state.sdks.find(sdk => sdk.spaceId === space.id)

    const actualPreviewEntry = await sdks.preview.entry(entry.id)
    const contentType = await sdks.preview.contentType(actualPreviewEntry.sys.contentType.id)

    return {
      title: actualPreviewEntry.fields[contentType.displayField],
      publishedState: await this.getPublishedState(actualPreviewEntry, sdks),
      contentTypeName: contentType.name
    }
  }

  async buildEntries(value, spaces) {
    let entries = []

    value.forEach(async e => {
      const builtEntry = await this.buildEntry(e, spaces)
      try {
        entries.push({
          ...builtEntry,
          sourceSpace: `Space ID: ${e.spaceId}`
        })
      } catch {
        // explicitly do nothing
      }
    })

    return entries
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);

    this.buildEntries(this.state.value, this.state.spaces).then(entries => this.setState({ entries }))
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  render() {
    return (
      <>
        {this.state.entries.forEach((e, i) => {
          <EntryCard
            key={i}
            title={e.title}
            status={e.publishedState}
            contentType={e.contentTypeName}
            description={e.sourceSpace}
          />
        })}
      </>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
