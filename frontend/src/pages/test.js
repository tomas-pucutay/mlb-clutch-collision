import { FaPlus, FaMinus } from "react-icons/fa";

const LowerSection = styled.div`
  height: 50%;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #F0F0F0;
  justify-content: flex-start; /* Asegura que los elementos comiencen desde arriba */
  align-items: center;
`;

const AccordionWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 10px;
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

const AccordionContent = styled.div`
  padding: 15px;
  background-color: #2d3748;
  margin-top: 5px;
  border-radius: 10px;
  color: white;
  transition: max-height 0.3s ease-in-out;
`;

const Match = () => {
  const [expandedPlays, setExpandedPlays] = useState([]);

  const toggleAccordion = (index) => {
    setExpandedPlays((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const plays = [
    { play: "Swinging Strike", result: "Strikeout" },
    { play: "Ball", result: "Walk" },
    { play: "Foul", result: "Foul Ball" },
    { play: "Grounder", result: "Ground Out" },
  ];

  return (
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
              {expandedPlays.includes(index) && (
                <AccordionContent>
                  <p>{play.result}</p>
                </AccordionContent>
              )}
            </AccordionWrapper>
          ))}
        </>
      )}
    </LowerSection>
  );
};
