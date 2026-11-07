from gtts import gTTS

# English instructions for form filling (Indian accent)
tts_text = (
    "Filling this form is very easy. "
    "First, please enter your full name, age, and your village or district. "
    "If you wish, you can also provide your phone number. "
    "Next, tell us if you are pregnant. "
    "If yes, mention how many weeks or months. "
    "If you have any health issues like anemia, diabetes, or BP, please select them. "
    "Also, mention how many meals you eat in a day and if you take any supplements. "
    "If you have children, enter the number and their ages. "
    "If any child is underweight or falls sick often, select yes. "
    "Choose if you want voice-based advice and how often you want reminders. "
    "Finally, tick the consent box and press the 'Create My Digital Twin' button. "
    "If you have any doubt in any question, please take help from your family or health worker. "
    "Thank you!"
)

tts = gTTS(text=tts_text, lang='en', tld='co.in')  # 'co.in' for Indian English accent
output_file = "help_en.mp3"
tts.save(output_file)
print("Audio file 'help_en.mp3' created successfully!")
