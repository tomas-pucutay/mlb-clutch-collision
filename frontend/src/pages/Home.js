import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HomeContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(${require('../assets/MLB_Clutch_Collision.jpg')}) no-repeat center center;
  background-size: cover;
  position: relative;
`;

const StartButton = styled(motion.button)`
  padding: 20px 40px;
  font-size: 2rem;
  background-color: #0f4b5b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #08535d;
  }
`;

const Home = ({ onStart }) => {
  return (
    <HomeContainer>
      <StartButton 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        onClick={onStart}
      >
        INICIAR
      </StartButton>
    </HomeContainer>
  );
};

export default Home;