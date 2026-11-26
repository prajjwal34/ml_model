# Interactive Flask Demo

## Project structure
```
model_folder/
├─ app.py                # Flask backend
├─ requirements.txt      # Python dependencies
├─ templates/
│   └─ index.html       # Front‑end HTML
├─ static/
│   ├─ style.css        # Styling (teal‑purple theme)
│   └─ script.js        # Front‑end logic (POST /api/process)
└─ README.md             # This file
```

## How to run
1. **Install dependencies** (only needed once):
   ```powershell
   pip install -r requirements.txt
   ```
2. **Start the server**:
   ```powershell
   python app.py
   ```
   The development server will listen on **http://localhost:5000**.
3. Open a browser and navigate to that URL. You will see a simple interactive page where you can type text, press **Send**, and receive the processed (uppercase) result.

## Customisation
- Edit `process_input` in **app.py** to implement any business logic you need.
- Change the colours in **static/style.css** to suit your brand.
- Extend the front‑end HTML in **templates/index.html** for more inputs or visualisations.

Enjoy experimenting!
