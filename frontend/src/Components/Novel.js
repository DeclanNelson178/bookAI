import React, {useEffect, useState} from 'react';
import NovelCard from './NovelCard';
import CharacterCard from './CharacterCard';



const Novel = ({ novel }) => {

    const getCharacterCards = () => {
        const characterCards = []
        for (let i = 0; i < novel.characters.length; i++) {
            const character = novel.characters[i];
            characterCards.push(<CharacterCard key={i} character={character} />);
        }
        return characterCards;
    }


    return (
        <>
            <NovelCard novel={novel}/>
            <CharacterCard novel={novel} />
        </>
    )
}

export default Novel;