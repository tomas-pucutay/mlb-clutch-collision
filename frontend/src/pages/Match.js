import axios from 'axios';
import { motion } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";
import React, { useState } from 'react';
import styled from 'styled-components';

import { playersDictBatter, playersDictPitcher } from '../data/playersData';

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

const HeaderText = styled.h1`
  color: white;
  font-size: 1.0rem;
  font-weight: bold;
`;

const HeaderLogo = styled.img`
  height: 40px;
  margin-right: 15px;
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
    color: black;
  }
`;

const PlayerImageContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const PlayerImage = styled.img`
  height: 120px;
  border-radius: 8px;
  margin-left: 0; 
`;

const VsTextButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 150px;
  position: relative;
`;

const VsTextButton = styled(motion.button)`
  width: 100px;
  height: 100px;
  background-image: url(${require('../assets/baseball.png')});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-size: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #08535d;
  }

  /* Media query para pantallas pequeñas */
  @media (max-width: 768px) {
    font-size: 35px;
    width: 70px;
    height: 70px;
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
  min-width: 200px;
  padding: 5px 15px;
  font-size: 0.8rem;
  color: black;
  background-color:rgb(255, 255, 255);  
  border: none;
  border-bottom: 2px solid #bbb;
  margin-top: 5px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #0f4b5b;
  }
  
  option {
    background-color:rgb(213, 217, 255);
  }

  /* Media query para pantallas medianas */
  @media (max-width: 768px) {
    padding: 2px 10px;
    min-width: 150px;
    font-size: 0.7rem;
  }
`;

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

const VsMessageContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  z-index: 10;
  max-width: 200px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  word-wrap: break-word;
  
 
  @media (max-width: 768px) {
    font-size: 0.7rem;
    max-width:25%;
  }
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
  const [plays, setPlays] = useState([]);
  const [vsMessage, setVsMessage] = useState('');

  const textToRead = "Hello, this is only a test for only fans.";

  const synthesizeSpeech = async () => {
    try {
      const response = await axios.post("http://localhost:5000/synthesize", { text: textToRead });
      if (response.data.audio) {
        setAudioUrl(response.data.audio);
        new Audio(response.data.audio).play();
      } else {
        console.error("Error en la síntesis de voz:", response.data);
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

  const handleStartMatch = async () => {
    if (!batterSeason || !selectedBatter || !pitcherSeason || !selectedPitcher) {
      setVsMessage("Select batter & pitcher, and the season");
      return;
    }

    const batterId = playersDictBatter[batterCategory][selectedBatter]?.id;
    const pitcherId = playersDictPitcher[pitcherCategory][selectedPitcher]?.id;

    if (!batterId || !pitcherId) {
      console.error("Player ID not found.");
      return;
    }

    // PLAY EVENTS API

    try {
      const response = await axios.get("http://localhost:5000/get_play_events", {
        params: {
          batter_season: batterSeason,
          batter_id: batterId,
          pitcher_season: pitcherSeason,
          pitcher_id: pitcherId
        }
      });

      let dataString = response.data.play_events;
      dataString = dataString.replace(/'/g, '"');
      dataString = dataString.replace(/\bFalse\b/g, 'false').replace(/\bTrue\b/g, 'true');

      let data = [];
      try {
        data = JSON.parse(dataString);
      } catch (e) {
        console.error("Error parsing API response:", e);
      }

      if (!Array.isArray(data)) {
        console.error("API response is not an array.");
        return;
      }

      const filteredData = data.filter(item => item.details?.call);
      console.log(`Found ${filteredData.length} events 'details.call'`);
  
      const mappedData = await Promise.all(
        filteredData.map(async (item) => {
          const playText = `${item.details.code} - ${item.details.description}`;
          
          try {
            const storyResponse = await axios.post("http://localhost:5000/generate_story", {
              event: item.details,
              batter_name: "Babe Ruth",
              batter_season: "1920",
              pitcher_name: "Chris Sales",
              pitcher_season: "2024",
              user_choice: "technical"
            });

            console.log(storyResponse.data)
  
            return {
              play: playText,
              result: storyResponse.data.story || "No story available"
            };
          } catch (error) {
            console.error("Error fetching story:", error);
            return {
              play: playText,
              result: "Error generating story"
            };
          }
        })
      );
      
      console.log(mappedData);
      setPlays(mappedData);
      setIsMatchStarted(true);

      // EVENT API

      const eventResponse = await axios.get("http://localhost:5000/get_event", {
        params: {
          batter_season: batterSeason,
          batter_id: batterId,
          pitcher_season: pitcherSeason,
          pitcher_id: pitcherId
        }
      });

      if (eventResponse.data && eventResponse.data) {
        setVsMessage(`Match result: ${eventResponse.data.event_type}`);
      } else {
        setVsMessage("Event data could not be retrieved.");
      }

    } catch (error) {
      console.error("API request error:", error);
      setVsMessage("Error occurred while fetching the data.");
    }
  };

  const VsButton = () => {
    const buttonAnimation = {
      rest: {
        scale: 1,
        rotate: 0,
        transition: { duration: 0.2 },
      },
      pressed: {
        scale: 1.2,
        rotate: 10,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      },
    };
  
    return (
      <VsTextButton
        variants={buttonAnimation}
        initial="rest"
        whileTap="pressed"
        onClick={handleStartMatch}
      >
        VS
      </VsTextButton>
    );
  };

  const toggleAccordion = (index) => {
    setExpandedPlays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

   return (
    <MatchContainer>
      {/* Header */}
      <Header>
        <HeaderLogo src="https://www.mlbstatic.com/team-logos/league-on-dark/1.svg" alt="MLB Logo" />
        <HeaderText>MLB Clutch Collision</HeaderText>
      </Header>
      <UpperSection>
        {/* Batter */}
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
        <VsTextButtonContainer>
          <VsButton />
        </VsTextButtonContainer>
        
                
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
      
      {/* Dynamic text */}
      {vsMessage && (
        <VsMessageContainer>
          <h3>{vsMessage}</h3>
        </VsMessageContainer>
      )}

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
