import React, {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import CanvasJSReact from '../canvasjs.react';
let CanvasJS = CanvasJSReact.CanvasJS;
let CanvasJSChart = CanvasJSReact.CanvasJSChart;


const formatSentences = (sentences) => {
    return (
        <ol>
            {sentences.map((sentence, i) => <li key={i}>{sentence}</li>)}
        </ol>
    )
} 

const CharacterCard = ({ character}) => {

    const getDataPoints = () => {
        const scores = character.sentiment_analysis_scores;
        const indices = character.sentiment_analysis_indices;
        
        const datapoints = []
        for (let i = 0; i < indices.length; i++) {
            datapoints.push({x: indices[i], y: scores[i]});
        }
        
        return datapoints;
    }

    const options = {
        theme: "light2",
        animationEnabled: true.valueOf,
        zoomEnabled: true,
        title: {
            text: character.name
        },
        data: [{
            type: "scatter",
            markerColor: "black",
            dataPoints: getDataPoints()
        }]
    }

    return (
        <Card sx={{ my: 4, minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom>
                    {character.name}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Occurrence Count: {character.occurrence_count}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Average Polarity: {character.avg_polarity.toFixed(2)}
                </Typography>
                <CanvasJSChart options={options} />
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Most Positive Sentences:
                </Typography>
                {formatSentences(character.most_positive_sentences)}
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Most Negative Sentences:
                </Typography>
                {formatSentences(character.least_positive_sentences)}
            </CardContent>
        </Card>
    )

}

export default CharacterCard;