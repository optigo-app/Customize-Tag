import React, { createContext, useContext, useState } from 'react';

const TagContext = createContext();

const DEFAULT_TAGS = [
  {
    id: 1,
    name: 'Jewellery Tag',
    design: 'tag1',
    width: 60,
    height: 30,
    unit: 'mm',
    fontSize: 10,
    borderWidth: 1,
    codeType: 'barcode',
    codeWidth: 40,
    codeHeight: 12,
    variables: [
      { id: 'v1', label: 'Gross Wt', value: 'grosswt' },
      { id: 'v2', label: 'Net Wt', value: 'netwt' },
    ],
  },
  {
    id: 2,
    name: 'Gold Tag',
    design: 'tag2',
    width: 50,
    height: 25,
    unit: 'mm',
    fontSize: 9,
    borderWidth: 1,
    codeType: 'qr',
    codeWidth: 20,
    codeHeight: 20,
    variables: [
      { id: 'v1', label: 'Item Code', value: 'itemcode' },
      { id: 'v2', label: 'Price', value: 'price' },
    ],
  },
];

export function TagProvider({ children }) {
  const [tags, setTags] = useState(DEFAULT_TAGS);

  const addTag = (tag) => {
    setTags((prev) => [...prev, { ...tag, id: Date.now() }]);
  };

  const updateTag = (id, updatedTag) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTag } : t)));
  };

  const deleteTag = (id) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TagContext.Provider value={{ tags, addTag, updateTag, deleteTag }}>
      {children}
    </TagContext.Provider>
  );
}

export function useTags() {
  return useContext(TagContext);
}