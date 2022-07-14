import * as React from 'react';
import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Autocomplete, TextField } from '@mui/material';
import db from "./db";
import "firebase/firestore";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import Novel from './Components/Novel';


export default function App() {
  const [novels, setNovels] = useState([]);
  const [titles, setTitles] = useState([]);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [novelData, setNovelData] = useState([]);

  const getNovels = async () => {
    console.log('getting novels')
    const bookCol = collection(db, 'book');
    const bookSnapshot = await getDocs(bookCol);
    const bookList = bookSnapshot.docs.map(doc => doc.data());
    setNovels(bookList)
    const titles = bookList.map(book => book.title);
    setTitles(titles);
  }

  React.useEffect(() => {
    getNovels();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Project Gutenberg NLP Analysis
        </Typography>
        <Typography sx={{ mt: 6, mb: 3 }}>
          Select a novel:
        </Typography>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={titles}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Novels" />}
          onChange={(_event, title) => {
            const novel = novels.find((novel) => novel.title == title)
            setSelectedNovel(novel);
          }}
        />
        {selectedNovel ? <Novel novel={selectedNovel}/> : <p>No novel selected</p>}
      </Box>
    </Container>
  );
}