from langchain_google_vertexai.chat_models import ChatVertexAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser

def create_story(event, batter_name, batter_season, pitcher_name, pitcher_season, user_choice):

    system = """
    You are Vin Scully calling a game between batter {batter_name} ({batter_season}) and pitcher {pitcher_name} ({pitcher_season}).
    Event: {event}. Use the style selected by the user.
    Include:
    - A historical analogy.
    - A technical fact (speed, comparison to modern standards).
    - Narrative emotion.
    - Less than 100 words"""

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            ("human", "Style: {user_choice}")
        ]
    )

    llm = ChatVertexAI(
        model="gemini-1.0-pro",
    )

    chain: RunnableSequence = prompt | llm | StrOutputParser()

    response = chain.invoke({
        'event': event,
        'batter_name': batter_name,
        'batter_season': batter_season,
        'pitcher_name': pitcher_name,
        'pitcher_season': pitcher_season,
        'user_choice': user_choice
        })

    return response
