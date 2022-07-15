import React, { useState, useEffect } from 'react';
import Novel from './Novel';

import { Autocomplete, TextField } from '@mui/material';

import db from "../db";
import "firebase/firestore";
import { collection, getDocs } from 'firebase/firestore/lite';


const AutocompleteComponent = () => {
    const [novels, setNovels] = useState([]);
    const [titles, setTitles] = useState([]);
    const [selectedNovel, setSelectedNovel] = useState(null);
    const [aboutEnabled, setAboutEnabled] = useState(false);
  
    const getNovels = async () => {
      console.log('getting novels')
      const bookCol = collection(db, 'book');
      const bookSnapshot = await getDocs(bookCol);
      const bookList = bookSnapshot.docs.map(doc => doc.data());
      setNovels(bookList)
      const titles = bookList.map(book => book.title);
      setTitles(titles);
    }
  
    useEffect(() => {
      getNovels();
    }, []);

    return (
        <>
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={titles}
                color="inherit"
                sx={{flexGrow: 1, my: 3}}
                renderInput={(params) => <TextField {...params} label="Select Novel" />}
                onChange={(_event, title) => {
                const novel = novels.find((novel) => novel.title == title)
                setSelectedNovel(novel);
                }}
            />
            {selectedNovel ? <Novel novel={selectedNovel}/> : <p></p>}
        </>
    )
}

export default AutocompleteComponent;