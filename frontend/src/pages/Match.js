import { motion } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";
import React, { useState } from 'react';
import styled from 'styled-components';

const MatchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color:#FFFFFF;
  color: white;
  padding: 20px;
`;

const Header = styled.div`
  background-color: #041e42;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  padding: 0 20px;
`;

const HeaderLogo = styled.img`
  height: 40px;
  width: auto;
`;

const UpperSection = styled.div`
  height: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
`;

const LowerSection = styled.div`
  height: 50%;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color:#F0F0F0;
  justify-content: flex-start;
  align-items: center;

  h3 {
    color: black; /* Asegura que el texto sea negro */
  }
`;


const PlayerImageContainer = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const PlayerImage = styled.img`
  height: 120px;
  width: 120px;
  border-radius: 8px;
  margin-left: 20px;
`;

const VsTextButton = styled.button`
  padding: 15px 30px;
  font-size: 2rem;
  background-color: #0f4b5b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #08535d;
  }
`;

const SpeechButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #218838;
  }
`;

const CategoryLabel = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: black;
  margin-bottom: 8px;
  padding: 5px;
  border-radius: 5px;
`;

const PlayerSelectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 200px;
`;

const PlayerSelection = styled.select`
  padding: 10px 15px;
  font-size: 1rem;
  color: black;
  background-color: #f2f2f2;
  border: none;
  border-bottom: 2px solid #bbb;
  margin-top: 10px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #0f4b5b;
  }
  
  option {
    background-color: #f2f2f2;
  }
`;

const playersDictBatter = {
    'Best 2024': {
      'Shohei Ohtani': {
        id: '660271',
        seasons: ['2024', '2023'],
      },
      'Mike Trout': {
        id: '545361',
        seasons: ['2024', '2023'],
      },
    },
    'Best all time': {
      'Babe Ruth': {
        id: '12345',
        seasons: ['1927', '1930'],
      },
      'Ty Cobb': {
        id: '67890',
        seasons: ['1910', '1915'],
      },
    },
  };
  
  const playersDictPitcher = {
    'Best 2024': {
      'Max Scherzer': {
        id: '453118',
        seasons: ['2024', '2023'],
      },
      'Gerrit Cole': {
        id: '453221',
        seasons: ['2024', '2023'],
      },
    },
    'Best all time': {
      'Walter Johnson': {
        id: '453089',
        seasons: ['1910', '1915'],
      },
      'Cy Young': {
        id: '453003',
        seasons: ['1901', '1905'],
      },
    },
  };

  const AccordionButton = styled.button`
  background-color: #1f2937;
  color: white;
  padding: 15px;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #374151;
  }
`;

const AccordionWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 10px;
`;


const AccordionContent = ({ isOpen, children }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    style={{
      overflow: "hidden",
      backgroundColor: "#2d3748",
      borderRadius: "10px",
      padding: isOpen ? "15px" : "0px",
      marginTop: "5px",
      color: "white",
    }}
  >
    {children}
  </motion.div>
);

const Match = () => {
  const [batterCategory, setBatterCategory] = useState('Best 2024');
  const [pitcherCategory, setPitcherCategory] = useState('Best 2024');
  const [selectedBatter, setSelectedBatter] = useState('');
  const [selectedPitcher, setSelectedPitcher] = useState('');
  const [batterSeason, setBatterSeason] = useState('');
  const [pitcherSeason, setPitcherSeason] = useState('');
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [expandedPlays, setExpandedPlays] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);

  const textToRead = "Hello, this is only a test for only fans.";

  const synthesizeSpeech = async () => {
    try {
      const response = await fetch("http://localhost:5000/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRead }),
      });
  
      const data = await response.json();
      if (data.audio) {
        setAudioUrl(data.audio);
        const audio = new Audio(data.audio);
        audio.play();
      } else {
        console.error("Error en la síntesis de voz:", data);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleBatterCategoryChange = (e) => {
    setBatterCategory(e.target.value);
    setSelectedBatter('');
    setBatterSeason('');
  };
    
  const handlePitcherCategoryChange = (e) => {
    setPitcherCategory(e.target.value);
    setSelectedPitcher('');
    setPitcherSeason('');
  };
    
  const handleBatterPlayerChange = (e) => {
    setSelectedBatter(e.target.value);
    setBatterSeason('');
  };
    
  const handlePitcherPlayerChange = (e) => {
    setSelectedPitcher(e.target.value);
    setPitcherSeason('');
  };
    
  const handleBatterSeasonChange = (e) => {
    setBatterSeason(e.target.value);
  };
    
  const handlePitcherSeasonChange = (e) => {
    setPitcherSeason(e.target.value);
  };

  const handleStartMatch = () => {
    setIsMatchStarted(true);
  };

  const toggleAccordion = (index) => {
    setExpandedPlays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Datos simulados para el acordeón
  const plays = [
    { play: 'Swinging Strike', result: 'Strikeout' },
    { play: 'Ball', result: 'Walk' },
    { play: 'Foul', result: 'Foul Ball' },
    { play: 'Grounder', result: 'Ground Out' },
  ];

  return (
    <MatchContainer>
      {/* Header */}
      <Header>
        <HeaderLogo src="https://www.mlbstatic.com/team-logos/league-on-dark/1.svg" alt="MLB Logo" />
      </Header>
      <UpperSection>
        {/* Bateador */}
        <div>
          <CategoryLabel>Batter</CategoryLabel>
            <PlayerSelectionWrapper>
              <PlayerSelection onChange={handleBatterCategoryChange} value={batterCategory}>
                <option value="Best 2024">Best 2024</option>
                <option value="Best all time">Best all time</option>
              </PlayerSelection>
    
              <PlayerSelection
                onChange={handleBatterPlayerChange}
                value={selectedBatter}
                disabled={!batterCategory}
              >
                <option value="">Batter</option>
                {Object.keys(playersDictBatter[batterCategory]).map((player) => (
                  <option key={player} value={player}>
                    {player}
                  </option>
                ))}
              </PlayerSelection>
    
              {selectedBatter && (
                <>
                  <PlayerSelection
                    onChange={handleBatterSeasonChange}
                    value={batterSeason}
                    disabled={!selectedBatter}
                  >
                    <option value="">Season</option>
                    {playersDictBatter[batterCategory][selectedBatter].seasons.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </PlayerSelection>

                  <PlayerImageContainer>
                  <PlayerImage
                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_213,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${playersDictBatter[batterCategory][selectedBatter].id}/headshot/67/current`}
                    alt="Bateador"
                  />
                  </PlayerImageContainer>
                </>
              )}
            </PlayerSelectionWrapper>
        </div>
  
          {/* Separator VS */}
        <div>
          <VsTextButton onClick={handleStartMatch}>
            VS
          </VsTextButton>
        </div>

        {/* Pitcher */}
        <div>
        <CategoryLabel>Pitcher</CategoryLabel>
          <PlayerSelectionWrapper>
            <PlayerSelection onChange={handlePitcherCategoryChange} value={pitcherCategory}>
              <option value="Best 2024">Best 2024</option>
              <option value="Best all time">Best all time</option>
            </PlayerSelection>
  
            <PlayerSelection
              onChange={handlePitcherPlayerChange}
              value={selectedPitcher}
              disabled={!pitcherCategory}
            >
              <option value="">Pitcher</option>
              {Object.keys(playersDictPitcher[pitcherCategory]).map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </PlayerSelection>
  
            {selectedPitcher && (
              <>
                <PlayerSelection
                  onChange={handlePitcherSeasonChange}
                  value={pitcherSeason}
                  disabled={!selectedPitcher}
                >
                  <option value="">Season</option>
                  {playersDictPitcher[pitcherCategory][selectedPitcher].seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </PlayerSelection>
                <PlayerImageContainer>
                <PlayerImage
                  src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_213,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${playersDictPitcher[pitcherCategory][selectedPitcher].id}/headshot/67/current`}
                  alt="Lanzador"
                />
              </PlayerImageContainer>
              </>
            )}
          </PlayerSelectionWrapper>
        </div>
      </UpperSection>

      <LowerSection>
        {!isMatchStarted ? (
          <h3>Waiting match...</h3>
        ) : (
          <>
            <h3>Game Details</h3>
              {plays.map((play, index) => (
                <AccordionWrapper key={index}>
                  <AccordionButton onClick={() => toggleAccordion(index)}>
                    {play.play}
                    {expandedPlays.includes(index) ? <FaMinus /> : <FaPlus />}
                  </AccordionButton>
                  <AccordionContent isOpen={expandedPlays.includes(index)}>
                    <p>{play.result}</p>
                  </AccordionContent>
                </AccordionWrapper>
              ))}
          </>
        )}
        <p>{textToRead}</p>
        <SpeechButton onClick={synthesizeSpeech}>Reproducir Texto</SpeechButton>
        {audioUrl && <audio src={audioUrl} autoPlay onEnded={() => console.log("Audio finished")} />}
      </LowerSection>
    </MatchContainer>
  );
};

export default Match;
