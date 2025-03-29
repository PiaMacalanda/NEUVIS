# Welcome to NEUVIS - Virtual Identification System 🧪👋

NEUVIS is a Virtual Identification System designed to streamline visitor management in New Era University. Built with React Native, Expo, Supabase, and TypeScript, it enables security officers and administrators to verify, log, and track visitor check-ins and check-outs efficiently.

## 📌 Tech Stack  
- **React Native** - Mobile app framework  
- **Expo** - Development environment  
- **Supabase** - Backend services  
- **TypeScript** - Strongly typed JavaScript  

## Get Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PiaMacalanda/NEUVIS.git
   cd NEUVIS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables** (working on🚧)  
   Create a `.env` file in the root directory and add:  
   ```plaintext
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the Development Server with Expo Dev Build**
   ```bash
   npx expo start -c
   ```
   - The `-c` flag clears the cache to ensure a fresh start.
   - Make sure you have the **Expo Dev Build** installed on your Android device.
   - Connect your device via USB or ensure it is on the same network as your development machine.
   - If the automatic build does not work, manually input the **Metro bundler URL** displayed in the terminal into the **Expo Dev Build** app.

5. **GitHub Repository**
   [NEUVIS Repository](https://github.com/PiaMacalanda/NEUVIS)

## 🛠 Collaborative Development Guide

### Creating a Branch
Always create a new branch when working on a new feature or fixing a bug to keep the `main` branch stable.
```bash
git checkout -b feature-branch-name
```
Example:
```bash
git checkout -b add-login-feature
```

### Committing Changes
Make meaningful commit messages describing what you changed.
```bash
git add .
git commit -m "Added login functionality with Google Auth"
```

### Pushing Changes
Push your branch to the remote repository.
```bash
git push origin feature-branch-name
```
Example:
```bash
git push origin add-login-feature
```

### Creating a Pull Request (PR)
1. Go to the GitHub repository: [NEUVIS Repository](https://github.com/PiaMacalanda/NEUVIS)
2. Click on the **Pull Requests** tab.
3. Click **New pull request**.
4. Select your feature branch and compare it with `main`.
5. Click **Create pull request**, provide a description, and submit.
6. Wait for a team member to review and approve before merging.

### Merging to Main
Only merge changes into `main` after a successful PR review.
```bash
git checkout main
git pull origin main
git merge feature-branch-name
```

### Keeping Your Branch Updated
Before pushing your changes, sync your branch with `main` to avoid conflicts.
```bash
git checkout main
git pull origin main
git checkout feature-branch-name
git merge main
```

## 📚 Additional Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Google Auth for Expo](https://docs.expo.dev/guides/authentication/#google)

## 👨‍💻 Project Team
- **Pia Macalanda** - Lead Developer & Scrum Master - [GitHub](https://github.com/PiaMacalanda)
- **Jaime III Dy** - Backend Developer & Security Specialist - [GitHub](https://github.com/JaimeDyIII)
- **Angelica Toquero** - Backend Developer - [GitHub](https://github.com/AngelicaToquero)
- **Aliyah Llana** - UI/UX Designer - [GitHub](https://github.com/AliyahAira)
- **Leo Rentazida** - UI/UX Designer - [GitHub](https://github.com/leorentazida)
- **Lyrine Poliarco** - Database Analyst - [GitHub](https://github.com/LyrinePoliarco)
- **Testers** - ALL  

Happy coding! ✨💻

