# Welcome to NEUVIS - Virtual Identification System 🪪👋

NEUVIS is a Virtual Identification System designed to streamline visitor management in New Era University. Built with React Native, Expo, Supabase, and TypeScript, it enables security officers and administrators to verify, log, and track visitor check-ins and check-outs efficiently.
 
## 📌 Tech Stack  
- **React Native** - Mobile app framework  
- **Expo** - Development environment  
- **Supabase** - Backend services  
- **TypeScript** - Strongly typed JavaScript  

## Get started

1. Clone the Repository

   ```bash
   git clone https://github.com/PiaMacalanda/NEUVIS.git
   cd NEUVIS
   ```
2. Install dependencies

   ```bash
   npm install
   ```

3. Install Expo Go on Your Mobile Device  
**Why do we need Expo Go?**  
Expo Go allows us to run and test our React Native app directly on a physical device without the need for a complicated build process. It enables **live reloading**, meaning any changes made in the code will reflect in real-time on the app without restarting the development server.  

📲 **To install Expo Go:**  
- **For Android:** [Download from Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)  
- **For iOS:** [Download from the App Store](https://apps.apple.com/app/expo-go/id982107779)  

Once installed, you'll be able to scan the QR code provided by `npx expo start` to run the app on your phone.  

4. Set Up Environment Variables (working on🚧) 
Create a `.env` file in the root directory and add: 

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the Development Server

   ```bash
    npx expo start
   ```
- If using a **physical device**, open **Expo Go** and scan the QR code displayed in your terminal or browser.  
- If using an **emulator**, make sure it's running before starting the project.  

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Additional Resources
📚 Additional Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation]()
- [Supabase Documentation]()
- [TypeScript Documentation]()
- [Google Auth for Expo]()

## Project Team
- Project Manager: Pia Macalanda
- Design Analyst: Angelica Toquero
- Software Developers: Jaime Dy, Aliyah Llana
- Sofware Testers: Leo Rentazida, Lyrine Poliarco
