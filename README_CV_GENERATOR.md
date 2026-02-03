# Zambian CV Generator 🇿🇲

A professional CV/Resume generator designed specifically for Zambian job seekers with integrated mobile money payment options.

## Features

✅ **Multi-step CV Form**
- Personal Information
- Education History
- Work Experience
- Skills & Competencies

✅ **Live Preview**
- Real-time CV preview as you type
- Professional template design
- Zambian market-focused layout

✅ **Payment Integration**
- MTN Mobile Money
- Airtel Money
- Debit/Credit Cards
- Secure payment processing (ZMW 50)

✅ **PDF Generation**
- High-quality PDF output
- Professional formatting
- Instant download after payment

## Project Structure

```
my-react-app/                 # Frontend (React)
├── src/
│   ├── components/
│   │   ├── CVForm.js         # Multi-step form component
│   │   ├── CVForm.css
│   │   ├── CVPreview.js      # Live preview component
│   │   └── CVPreview.css
│   ├── pages/
│   │   ├── CVGenerator.js    # Main page
│   │   └── CVGenerator.css
│   └── App.js

cv-generator-backend/         # Backend (Flask/Python)
├── app.py                    # API server
├── requirements.txt          # Python dependencies
└── generated_cvs/            # PDF storage directory
```

## Installation & Setup

### Frontend (React)

1. Navigate to the React app:
```bash
cd /home/sheba/VS/my-react-app
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

### Backend (Flask/Python)

1. Navigate to the backend directory:
```bash
cd /home/sheba/VS/cv-generator-backend
```

2. Activate virtual environment:
```bash
source venv/bin/activate
```

3. Install dependencies (already done):
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```

The API will run on `http://localhost:5000`

## Usage

1. **Start both servers** (frontend and backend)
2. Open `http://localhost:3000` in your browser
3. Fill in the CV form with your information
4. Preview your CV in real-time on the right panel
5. Click "Download CV (ZMW 50)" button
6. Select payment method (MTN, Airtel, or Card)
7. Enter phone number and complete payment
8. Your CV will download automatically after successful payment

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Axios (API calls)
- React Toastify (notifications)
- CSS3 (styling)

### Backend
- Flask (Python web framework)
- Flask-CORS (cross-origin support)
- ReportLab (PDF generation)
- Python 3.13

## Payment Integration

Currently configured for demo mode. For production:

1. **MTN Mobile Money**: Integrate with MTN MoMo API
2. **Airtel Money**: Integrate with Airtel Money API
3. **Card Payments**: Use Flutterwave, Paystack, or similar

### Example Payment Gateway Integration

```python
# In app.py, replace the mock payment with real gateway:

import requests

def process_mtn_payment(phone_number, amount):
    # MTN MoMo API integration
    response = requests.post(
        'https://api.mtn.com/collection/v1_0/requesttopay',
        headers={
            'Authorization': 'Bearer YOUR_TOKEN',
            'X-Target-Environment': 'production'
        },
        json={
            'amount': str(amount),
            'currency': 'ZMW',
            'externalId': transaction_id,
            'payer': {'partyIdType': 'MSISDN', 'partyId': phone_number}
        }
    )
    return response.json()
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
# Add Procfile:
web: gunicorn app:app

# Install gunicorn:
pip install gunicorn
pip freeze > requirements.txt
```

## Future Enhancements

- [ ] Multiple CV templates
- [ ] Cover letter generator
- [ ] LinkedIn profile import
- [ ] Email delivery option
- [ ] User accounts & saved CVs
- [ ] Multi-language support (English & Local languages)
- [ ] Mobile app version

## Support

For issues or questions, contact support at your-email@example.com

## License

MIT License - feel free to use for personal or commercial projects.

---

Made with ❤️ for Zambian job seekers
