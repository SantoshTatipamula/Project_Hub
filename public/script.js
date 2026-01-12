// 1. IMPORT FIREBASE SERVICES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "project-hub-62a4b.firebaseapp.com",
  projectId: "project-hub-62a4b",
  storageBucket: "project-hub-62a4b.firebasestorage.app",
  messagingSenderId: "279993128950",
  appId: "YOUR_APP_ID"
};

// 3. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (window.lucide) lucide.createIcons();

  // --- GLOBAL THEME LOGIC ---
  const root = document.documentElement;
  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (window.lucide) lucide.createIcons();

    const mobileBtn = document.getElementById("theme-toggle-mobile");
    if (mobileBtn) {
      mobileBtn.classList.toggle("btn-outline-light", theme === "dark");
      mobileBtn.classList.toggle("btn-outline-dark", theme === "light");
    }
  };

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  document.querySelectorAll("#theme-toggle, #theme-toggle-mobile").forEach((btn) => {
    btn?.addEventListener("click", () => {
      const newTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    });
  });

  // --- AUTOMATIC NAVBAR SWITCHER ---
  onAuthStateChanged(auth, (user) => {
    const loginNav = document.getElementById("login-nav");
    const profileNav = document.getElementById("user-profile-nav");
    const mobileLogin = document.getElementById("mobile-login-nav");
    const mobileProfile = document.getElementById("mobile-profile-nav");

    const isLoggedIn = !!user;
    if (loginNav) loginNav.style.display = isLoggedIn ? "none" : "block";
    if (profileNav) profileNav.style.display = isLoggedIn ? "block" : "none";
    if (mobileLogin) mobileLogin.style.display = isLoggedIn ? "none" : "block";
    if (mobileProfile) mobileProfile.style.display = isLoggedIn ? "block" : "none";

    if (window.lucide) lucide.createIcons();
  });

  // --- UI HELPERS ---
  const alertBox = document.getElementById("auth-alert");
  const showPopup = (message, type) => {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `auth-popup show ${type === "success" ? "popup-success" : "popup-error"}`;
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.classList.remove("show");
      setTimeout(() => { alertBox.style.display = "none"; }, 400);
    }, 4000);
  };

  const setBtnLoading = (isLoading, defaultText) => {
    const btn = document.querySelector('button[type="submit"]');
    const text = document.getElementById("btnText");
    const spinner = document.getElementById("btnSpinner");
    if (btn) btn.disabled = isLoading;
    if (text) text.textContent = isLoading ? "Processing..." : defaultText;
    if (spinner) spinner.style.display = isLoading ? "inline-block" : "none";
  };

  // --- AUTH LOGIC (Forms) ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      setBtnLoading(true, "Sign In");
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showPopup("Login Successful!", "success");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } catch (error) {
        setBtnLoading(false, "Sign In");
        showPopup("Login Failed: " + error.message, "error");
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("fullname").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (password !== confirm) return showPopup("Passwords do not match!", "error");
      setBtnLoading(true, "Create Account");
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullname: name,
          email: email,
          joinedAt: new Date(),
          subscription: "Free",
        });
        showPopup("Account Created Successfully!", "success");
        setTimeout(() => (window.location.href = "index.html"), 2000);
      } catch (error) {
        setBtnLoading(false, "Create Account");
        showPopup("Signup Error: " + error.message, "error");
      }
    });
  }

  // --- SOCIAL LOGIN LOGIC ---
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", result.user.uid), {
        fullname: result.user.displayName,
        email: result.user.email,
        joinedAt: new Date(),
        subscription: "Free"
      }, { merge: true });
      window.location.href = "index.html";
    } catch (error) {
      console.error("Social Auth Error:", error.message);
      showPopup(error.message, "error");
    }
  };

  const googleBtn = document.querySelector('.btn-social-auth:has(img[alt*="Google" i])');
  const githubBtn = document.querySelector('.btn-social-auth:has(img[alt*="GitHub" i])');

  googleBtn?.addEventListener("click", () => handleSocialLogin(new GoogleAuthProvider()));
  githubBtn?.addEventListener("click", () => handleSocialLogin(new GithubAuthProvider()));

  // --- PROFILE PAGE LOGIC ---
  const profileContainer = document.getElementById("welcome-name");
  if (profileContainer) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          
          // Populate UI
          const elements = {
            "side-fullname": data.fullname || "User",
            "side-email": data.email,
            "welcome-name": data.fullname || "Student",
            "display-fullname": data.fullname || "Not Provided",
            "display-email": data.email,
            "display-plan": data.subscription || "Free",
            "display-validity": data.subscription === "Free" ? "Lifetime" : "30 Days Remaining"
          };

          Object.entries(elements).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
          });

          if (data.joinedAt) {
            const joinedEl = document.getElementById("display-joined");
            if (joinedEl) joinedEl.textContent = data.joinedAt.toDate().toLocaleDateString('en-IN');
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    });
  }

  // --- LOGOUT & ANIMATIONS ---
  document.getElementById("logout-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => (window.location.href = "index.html"));
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
});