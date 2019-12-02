import React from 'react'
import { css } from 'emotion'
import { EntityList, EntityListItem, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components'

const styles = {
  entry: css({
    figure: css({
      display: 'none'
    })
  })
}

const DescriptionLabel = ({spaceName, spaceId}) => {
  return (
    <span>
      {spaceName} (<code>{spaceId}</code>)
    </span>
  )
}

export default function EntryList ({entries, onSelectEntry, onRemoveEntry, onOpenEntry}) {
  if (!entries || entries.length === 0) {
    return (
      <p>
        <i>No entries...</i>
      </p>
    )
  }

  return (
    <EntityList>
    {entries.map((e, i) => {
      return <EntityListItem
        className={styles.entry}
        key={`${i}-${e.id}`}
        title={e.title}
        status={ e.id ? "published" : "draft" }
        contentType={e.contentTypeName}
        description={<DescriptionLabel spaceName={e.spaceName} spaceId={e.spaceId} />}
        onClick={!onSelectEntry ? undefined : async () => await onSelectEntry(e)}
        dropdownListElements={!(onRemoveEntry || onOpenEntry) ? undefined : (
            <DropdownList>
              {onOpenEntry && <DropdownListItem onClick={async () => await onOpenEntry(e)}>Open in a new tab</DropdownListItem>}
              {onRemoveEntry && <DropdownListItem onClick={async () => await onRemoveEntry(e)}>Remove</DropdownListItem>}
            </DropdownList>
          )
        }
      />
    })}
    </EntityList>
  )
}
