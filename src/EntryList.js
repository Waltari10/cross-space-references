import React from 'react'
import { EntryCard, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components'

export default function EntryList ({entries, onSelectEntry, onRemoveEntry, onOpenEntry}) {
  if (!entries || entries.length === 0) {
    return (
      <p>
        <i>No entries...</i>
      </p>
    )
  }

  return (
    <>
    {entries.map((e, i) => {
      return <EntryCard
        key={`${i}-${e.id}`}
        title={e.title}
        status={"published"}
        contentType={e.contentTypeName}
        description={`Space (${e.spaceName}) - ID: ${e.spaceId}`}
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
    </>
  )
}
