import google.cloud.texttospeech as tts
import base64

def synthesize_speech(text):
    client = tts.TextToSpeechClient()

    input_text = tts.SynthesisInput(text=text)

    voice = tts.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Wavenet-A",
        ssml_gender=tts.SsmlVoiceGender.MALE,
    )

    audio_config = tts.AudioConfig(
        audio_encoding=tts.AudioEncoding.MP3 #LINEAR16
        )

    response = client.synthesize_speech(
        input=input_text, voice=voice, audio_config=audio_config
    )

    audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")
    return audio_base64