from langchain_google_vertexai.chat_models import ChatVertexAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser

def create_story(text):

    system = "You are a helpful assistant"

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system),
            ("human", "Query: {query}")
        ]
    )

    llm = ChatVertexAI(
        model="gemini-1.0-pro",
    )

    chain: RunnableSequence = prompt | llm | StrOutputParser()

    response = chain.invoke({'query': text})

    return response
