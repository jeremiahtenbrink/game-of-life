import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Button, Input } from "antd";

/**
 *   GameOfLife
 *
 *  @component
 *
 */
const GameOfLife = ( props ) => {
  
  const [ gridSize, setGridSize ] = useState( 60 );
  const array = useRef();
  const keepPlaying = useRef( false );
  const [ playing, setPlaying ] = useState( false );
  const elementsWhosNeighborsChanged = useRef();
  const alive = useRef();
  const [ generation, setGeneration ] = useState( 1 );
  const [ ready, setReady ] = useState( false );
  
  useEffect( () => {
    setPlaying( false );
    setReady( false );
    alive.current = {};
    changeGridSize();
  }, [ gridSize ] );
  
  const changeGridSize = () => {
    
    array.current = [];
    for( let i = 0; i < gridSize; i++ ){
      array.current.push( [] );
      for( let j = 0; j < gridSize; j++ ){
        const object = {
          ref: React.createRef(),
          value: 0,
          neighbors: [],
          name: `${ i }_${ j }`,
          stationCount: 0,
        };
        for( let k = -1; k < 2; k++ ){
          try{
            const el = array.current[ i - 1 ][ j + k ];
            el.neighbors.push( object );
            object.neighbors.push( el );
          }catch( e ){
          
          }
        }
        
        if( j > 0 ){
          array.current[ i ][ j - 1 ].neighbors.push( object );
          object.neighbors.push( array.current[ i ][ j - 1 ] );
        }
        array.current[ i ].push( object );
      }
    }
    
    setReady( !ready );
  };
  
  const play = () => {
    if( !playing ){
      setPlaying( true );
    }
    const changeToBlue = [];
    const changeToWhite = [];
    
    
    Object.values( elementsWhosNeighborsChanged.current ).forEach( el => {
      
      
      let count = 0;
      el.neighbors.forEach( neighbor => {
        if( neighbor.value === 1 ){
          count++;
        }
      } );
      
      if( el.value === 1 ){
        if( count > 3 || count < 2 ){
          changeToWhite.push( el );
          el.stationCount = 0;
        }
      }else{
        if( count === 3 ){
          changeToBlue.push( el );
          el.stationCount = 0;
        }
        
      }
    } );
    
    elementsWhosNeighborsChanged.current = {};
    changeToBlue.forEach( object => {
      object.ref.current.setAttribute( "stroke", "blue" );
      object.value = 1;
      object.neighbors.forEach( neighbor => {
        elementsWhosNeighborsChanged.current[ neighbor.name ] = neighbor;
      } );
    } );
    
    changeToWhite.forEach( object => {
      alive.current[ object.name ] = object;
      object.ref.current.setAttribute( "stroke", "white" );
      object.value = 0;
      
      object.neighbors.forEach( neighbor => {
        elementsWhosNeighborsChanged.current[ neighbor.name ] = neighbor;
      } );
      
    } );
    
    setGeneration( state => state + 1 );
    Object.values( alive.current ).forEach( el => {
      el.stationCount++;
      el.ref.current.setAttribute( "fill",
        `rgba(${ 255 / el.stationCount }, 255, 255, 1)`,
      );
    } );
    
    if( keepPlaying.current ){
      requestAnimationFrame( play );
    }
    
  };
  
  const makeRandom = () => {
    if( !elementsWhosNeighborsChanged.current ){
      elementsWhosNeighborsChanged.current = {};
    }
    
    if( playing ){
      return;
    }
    const num = Math.ceil( Math.random() * ( gridSize * gridSize / 2 ) ) +
      gridSize * gridSize / 10;
    
    for( let i = 0; i < num; i++ ){
      const random1 = Math.floor( Math.random() * gridSize );
      const random2 = Math.floor( Math.random() * gridSize );
      const el = array.current[ random1 ][ random2 ];
      el.value = 1;
      alive.current[ el.name ] = el;
      el.ref.current.setAttribute( "stroke", "blue" );
      el.neighbors.forEach( neighbor => {
        elementsWhosNeighborsChanged.current[ neighbor.name ] = neighbor;
      } );
    }
    
  };
  
  const onCellClick = ( index1, index2 ) => {
    if( playing ){
      return;
    }
    array.current[ index1 ][ index2 ].ref.current.setAttribute( "stoke",
      "blue",
    );
  };
  
  const reset = () => {
    setReady( false );
    setGeneration( 0 );
    array.current.forEach( ( row, i ) => {
      row.forEach( ( el, index2 ) => {
        el.ref.current.setAttribute( "stroke", "white" );
        el.value = 0;
      } );
    } );
    setReady( true );
    
  };
  
  return ( <Container>
    <Grid>
      <svg width="100%" height="100%"
           viewBox="0 0 1000 1000"
           xmlns="http://www.w3.org/2000/svg">
        { Array.isArray( array.current ) &&
        array.current.map( ( row, index ) => {
          return row.map( ( val, index2 ) => {
            return <rect ref={ val.ref } width={ ( 1000 / gridSize ) }
                         height={ ( 1000 / gridSize ) }
                         transform={ `translate(${ 1000 / gridSize *
                         index2 }, ${ 1000 / gridSize * index })` }
                         fill={ "white" }
                         onClick={ () => onCellClick( index, index2 ) }
                         stroke="white"/>;
          } );
        } ) }
      </svg>
    </Grid>
    <GameButtons>
      <h1>Generation: { generation }</h1>
      <Button onClick={ makeRandom }
              disabled={ playing }>Randomize</Button>
      <Button onClick={ () => {
        if( playing ){
          keepPlaying.current = false;
          setPlaying( false );
          window.setTimeout( () => {
            setReady( !ready );
          }, 1000 );
        }else{
          keepPlaying.current = true;
          play();
        }
      } }>{ playing ? "Stop" : "Start" }</Button>
      <Button onClick={ () => {
        if( playing ){
          keepPlaying.current = false;
          setPlaying( false );
          reset();
        }else{
          reset();
        }
      } }>Reset</Button>
      <Input disabled={ playing }
             onChange={ ( e ) => setGridSize( e.target.value ) }
             value={ gridSize } type={ "number" }/>
    </GameButtons>
  </Container> );
};

const Grid = styled.div`
display: flex;
flex-direction: column;
width: 70%;
`;

const GameButtons = styled.div`
display: flex;
flex-direction: column;
height: 100%;
`;

const Container = styled.div`
display: flex;
flex-direction: row;
justify-content: space-around;
width: 100%;
height: 100%;
min-height: 70vh;
`;

GameOfLife.propTypes = {};

export default GameOfLife;