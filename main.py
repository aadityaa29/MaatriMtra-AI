from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from gtts import gTTS
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "*"],  # Add your frontend origins here, "*" allows all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/tts/hindi")
async def tts_hindi(request: Request):
    data = await request.json()
    text = data.get("text", "")
    if not text or not text.strip():
        return Response(content="No text provided", status_code=400)
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tf:
            tts = gTTS(text, lang='hi')
            tts.save(tf.name)
            filename = tf.name
        response = FileResponse(filename, media_type="audio/mpeg", filename="plan_hi.mp3")
        @response.call_on_close
        def cleanup():
            os.remove(filename)
        return response
    except Exception as e:
        print("gTTS error:", e)
        return Response(content=f"gTTS error: {e}", status_code=500)
