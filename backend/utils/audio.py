import google.cloud.texttospeech as tts
import base64

def synthesize_speech(text, lang='english'):
    client = tts.TextToSpeechClient()

    lang_dict = {
        'english': {'code': 'en-US', 'name': 'en-US-Wavenet-A'},
        'spanish': {'code': 'es-US', 'name': 'es-US-Wavenet-C'},
        'japanese': {'code': 'ja-JP', 'name': 'ja-JP-Wavenet-D'},
        'korean' : {'code': 'ko-KR', 'name': 'ko-KR-Wavenet-D'},
    }

    input_text = tts.SynthesisInput(text=text)

    voice = tts.VoiceSelectionParams(
        language_code=lang_dict[lang]['code'],
        name=lang_dict[lang]['name'],
        ssml_gender=tts.SsmlVoiceGender.MALE,
    )

    audio_config = tts.AudioConfig(
        audio_encoding=tts.AudioEncoding.MP3
        )

    response = client.synthesize_speech(
        input=input_text, voice=voice, audio_config=audio_config
    )

    audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")
    return audio_base64