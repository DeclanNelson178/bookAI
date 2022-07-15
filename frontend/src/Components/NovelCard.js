import React, {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import CanvasJSReact from '../canvasjs.react';
let CanvasJS = CanvasJSReact.CanvasJS;
let CanvasJSChart = CanvasJSReact.CanvasJSChart;


const NovelCard = ({ novel }) => {
    const getCharactersNames = () => {
        const characters = []
        novel.characters.forEach((character) => {
            characters.push(character.name)
        });

        return characters.join(', ')
    }

    const getDataPoints = () => {
        return novel.book_analysis.map((datapoint, i) => {
            return {x: i, y: datapoint}
        });
    }

    const options = {
        theme: "light2",
        animationEnabled: true.valueOf,
        zoomEnabled: true,
        title: {
            text: novel.title
        },
        data: [{
            type: "area",
            dataPoints: getDataPoints()
        }]
    }

    return (
        <Card sx={{ my: 4, minWidth: 275 }}>
            <CardContent>
                <Typography sx={{ fontSize: 20 }} color="text.primary" gutterBottom>
                    {novel.title}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    {novel.author ? novel.author : 'Author'}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Word Count: {novel.word_count}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Sentence Count: {novel.sentence_count}
                </Typography>
                <Typography sx={{ fontSize: 16 }} color="text.secondary" gutterBottom>
                    Characters: {getCharactersNames()}
                </Typography>
                <CanvasJSChart options={options} />
            </CardContent>
        </Card>
    )
}

export default NovelCard;