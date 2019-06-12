import React from 'react';
import { TagInput } from '@density/ui';
import formatTagName from '../../helpers/format-tag-name/index';
import AdminLocationsDetailModule from './index';

export default function AdminLocationsDetailModulesTags({
  title,
  tags,
  tagsCollection,
  placeholder,
  emptyTagsPlaceholder,
  processIntoSlug=true,
  onChangeTags,
}) {
  return (
    <AdminLocationsDetailModule title={title}>
      <TagInput
        choices={tagsCollection.data.map(f => ({id: f.name, label: f.name}))}
        tags={tags.filter(f => f.operationToPerform !== 'DELETE').map(f => ({id: f.name, label: f.name}))}
        placeholder={placeholder}
        emptyTagsPlaceholder={emptyTagsPlaceholder}
        onCreateNewTag={name => {
          name = processIntoSlug ? formatTagName(name) : name;
          const newTag = {
            name,
            operationToPerform: 'CREATE',
          };
          onChangeTags([...tags, newTag]);
        }}
        onAddTag={tag => {
          const previouslyDeletedTag = tags.find(
            t => t.name === tag.label && t.operationToPerform === 'DELETE'
          );
          onChangeTags([
            ...tags.filter(t => t.name !== tag.label),
            previouslyDeletedTag ? {
              ...previouslyDeletedTag,
              operationToPerform: null
            } : {
              name: tag.label,
              operationToPerform: 'CREATE'
            },
          ]);
        }}
        onRemoveTag={tag => {
          const otherTags = tags.filter(t => t.name !== tag.label);
          const tagToBeRemoved = tags.find(t => t.name === tag.label);

          if (tagToBeRemoved.operationToPerform !== 'CREATE') {
            // Exists on the server already, so delete it on the server
            onChangeTags([...otherTags, {...tagToBeRemoved, operationToPerform: 'DELETE'}]);
          } else {
            // Was never persisted to the server, so just remove it from the list
            onChangeTags(otherTags);
          }
        }}
      />
    </AdminLocationsDetailModule>
  );
}
