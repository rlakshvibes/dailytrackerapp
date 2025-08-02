# Daily Habit Tracker

A mobile-friendly Progressive Web App (PWA) for tracking daily micro habits with Google authentication and Google Sheets integration.

## Features

- 🔐 **Google Authentication** - Secure sign-in with Google accounts
- 📱 **Mobile-First Design** - Beautiful, responsive interface that works on all devices
- 📊 **Google Sheets Integration** - Store all your habit data in Google Sheets
- 📈 **Past Data Viewing** - View your historical habit entries
- 🎯 **Daily Summary** - See your completed habits for the day
- 📱 **PWA Support** - Install as a mobile app on your device
- 🔄 **Offline Capable** - Works even without internet connection

## Daily Habits Tracked

- ⏰ **Wake Time** - What time did you wake up?
- ☕ **Caffeine** - Did you drink caffeine today?
- 🚽 **Bowel Movement** - Did you have a bowel movement?
- 💪 **Exercise** - Did you exercise today?
- 🤕 **Headache** - Did you have a headache?
- 💧 **Water Intake** - How many glasses of water did you drink?
- 😴 **Sleep Hours** - How many hours did you sleep?

## Quick Start

### Prerequisites

- Google account
- Google Sheets (for data storage)
- Web hosting (GitHub Pages, Netlify, etc.)

### Setup Instructions

1. **Clone or download** this repository
2. **Set up Firebase** for authentication
3. **Create Google Sheet** for data storage
4. **Deploy Google Apps Script** for backend API
5. **Update configuration** in `app.js`
6. **Host the app** on your preferred platform

## Detailed Setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Google Authentication
5. Copy the Firebase config and update `app.js`

### 2. Google Sheets Setup

1. Create a new Google Sheet
2. Copy the spreadsheet ID from the URL
3. Update the `SPREADSHEET_ID` in `apps-script-code.gs`

### 3. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with `apps-script-code.gs`
4. Deploy as a web app
5. Copy the deployment URL and update `app.js`

### 4. Hosting

#### GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Your app will be available at `https://username.github.io/repository-name`

#### Other Options
- **Netlify**: Drag and drop your files
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase's hosting service

## Configuration

### Firebase Configuration
Update the Firebase config in `app.js`:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... etc
};
```

### Apps Script URL
Update the Apps Script URL in `app.js`:
```javascript
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

## Usage

1. **Sign in** with your Google account
2. **Fill out** the daily habit form
3. **Submit** your data
4. **View summary** of your day
5. **Check past data** to see your progress

## Customization

### Adding New Habits
1. Update the form in `index.html`
2. Update the data processing in `app.js`
3. Update the Apps Script code to handle new fields

### Changing Questions
Edit the form questions in `index.html` to track different habits.

### Styling
Modify `style.css` to change the app's appearance.

## Troubleshooting

### Authentication Issues
- Clear browser cookies and cache
- Check Firebase domain settings
- Ensure Google Authentication is enabled

### Data Not Saving
- Verify Apps Script URL is correct
- Check spreadsheet ID in Apps Script
- Ensure Apps Script is deployed as web app

### App Not Loading
- Check all files are uploaded correctly
- Verify Firebase config is correct
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all configuration is correct

## Future Enhancements

- 📊 **Analytics Dashboard** - Charts and insights
- 🔔 **Reminders** - Daily notifications
- 📤 **Data Export** - CSV/PDF reports
- 🎨 **Custom Themes** - Personalize the appearance
- 📱 **Native App** - iOS/Android versions

---

**Built with ❤️ for better habit tracking**
