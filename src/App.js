import React, { useState } from 'react';
import { TagProvider } from './context/TagContext';
import TagListPage from './pages/TagListPage';
import CustomizeTagPage from './pages/CustomizeTagPage';

export default function App() {
  const [page, setPage] = useState('list'); // 'list' | 'customize'
  const [editTag, setEditTag] = useState(null);

  const navigate = (target, tag = null) => {
    setEditTag(tag);
    setPage(target);
  };

  return (
    <TagProvider>
      {page === 'list' ? (
        <TagListPage onNavigate={navigate} />
      ) : (
        <CustomizeTagPage onNavigate={navigate} editTag={editTag} />
      )}
    </TagProvider>
  );
}