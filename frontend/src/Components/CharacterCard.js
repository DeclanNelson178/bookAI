import React, {useEffect, useState} from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';

import CanvasJSReact from '../canvasjs.react';
let CanvasJS = CanvasJSReact.CanvasJS;
let CanvasJSChart = CanvasJSReact.CanvasJSChart;


const CharacterCard = ({ novel }) => {

    const [selectedSentence, setSelectedSentence] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const [selectedScore, setSelectedScore] = useState('');

    const getData = () => {
        return novel.characters.map(character => {
            return {
                type: 'scatter',
                dataPoints: getDataPoints(character),
                name: character.name,
                showInLegend: true
            }
        });
    }

    const getDataPoints = (character) => {
        const scores = character.sentiment_analysis_scores;
        const indices = character.sentiment_analysis_indices;
        const sentences = character.sentiment_analysis_sentences;
        
        const datapoints = []
        for (let i = 0; i < indices.length; i++) {
            datapoints.push({
                x: indices[i], 
                y: scores[i], 
                label: sentences[i],
                click: (e) => {
                    setSelectedSentence(sentences[i]);
                    setSelectedCharacter(character.name);
                    setSelectedScore(scores[i]);
                }
            });
        }
        console.log(datapoints)
        
        return datapoints;
    }

    const options = {
        theme: "light2",
        animationEnabled: true.valueOf,
        zoomEnabled: true,
        title: {
            text: "Character Analysis"
        },
        legend: {
            cursor: "pointer",
        },
        axisX: {
            lineThickness: 0,
            labelFormatter: () => '',
            tickLength: 0
        },
        data: getData(),
    }

    return (
        <Card sx={{ my: 4, minWidth: 275 }}>
            <CardContent>
                <CanvasJSChart options={options} />
                <Typography sx={{ my: 2, fontSize: 14 }} color="text.secondary" gutterBottom>
                    Click data point to read sentence.
                </Typography>
                {selectedSentence ? <Box style={{paddingLeft: '5px', borderRadius: "5px",backgroundColor: "#D3D3D3"}}>
                    <Typography sx={{fontSize: 16, fontStyle: "italic"}} color="text.primary" gutterBottom>
                        {selectedSentence}
                    </Typography>
                    <Typography sx={{fontSize: 16}} color="text.primary" gutterBottom>
                        &nbsp;&nbsp;&nbsp;&nbsp;Reference: {selectedCharacter}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;Polarity Score: {selectedScore.toFixed(2)}
                    </Typography>
                </Box> : <></>}
            </CardContent>
            <CardContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 200 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Occurrence Count</TableCell>
                            <TableCell align="right">Avg Polarity</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {novel.characters.map((character) => (
                            <TableRow
                                key={character.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {character.name}
                                </TableCell>
                                <TableCell align="right">{character.occurrence_count}</TableCell>
                                <TableCell align="right">{character.avg_polarity.toFixed(3)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    )

}

export default CharacterCard;