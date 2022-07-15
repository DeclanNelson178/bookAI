import React, { useEffect, useState } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { TextField, AppBar, Toolbar, Button } from '@mui/material';

import AutocompleteComponent from './Components/AutocompleteComponent';

export default function App() {

  const [aboutEnabled, setAboutEnabled] = useState(false);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
              Project Gutenberg NLP Analysis
            </Typography>
            <Button color="inherit" component="a" href="https://github.com/DeclanNelson178/bookAI">About</Button>
          </Toolbar>
        </AppBar>
        <AutocompleteComponent/>
      </Box>
    </Container>
  );
}