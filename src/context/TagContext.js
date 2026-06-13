

import React, { createContext, useContext, useState, useEffect } from 'react';

const TagContext = createContext();
export function TagProvider({ children }) {

  const [tags, setTags] = useState(() => {
    const stored = localStorage.getItem("tags");
    return JSON.parse(stored)
  });

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags]);

  const addTag = (tag) => {
    setTags((prev) => [...prev, { ...tag, id: Date.now() }]);
  };

  const updateTag = (id, updatedTag) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedTag } : t))
    );
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