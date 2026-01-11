// 1. IMPORT FIREBASE SERVICES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyC68gxGrr0osLThBGXurV0BmVpBImMbAJ4",
  authDomain: "project-hub-62a4b.firebaseapp.com",
  projectId: "project-hub-62a4b",
  storageBucket: "project-hub-62a4b.firebasestorage.app",
  messagingSenderId: "279993128950",
  appId: "1:279993128950:web:ddec377a70c798073b59d7"
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

  document
    .querySelectorAll("#theme-toggle, #theme-toggle-mobile")
    .forEach((btn) => {
      btn?.addEventListener("click", () => {
        const newTheme =
          root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(newTheme);
      });
    });

  // --- AUTOMATIC NAVBAR SWITCHER (Auth Listener) ---
  const loginNav = document.getElementById("login-nav");
  const profileNav = document.getElementById("user-profile-nav");

  onAuthStateChanged(auth, (user) => {
    const loginNav = document.getElementById("login-nav");
    const profileNav = document.getElementById("user-profile-nav");
    const mobileLogin = document.getElementById("mobile-login-nav");
    const mobileProfile = document.getElementById("mobile-profile-nav");

    if (user) {
        // User is logged in
        if (loginNav) loginNav.style.display = "none";
        if (profileNav) profileNav.style.display = "block";
        if (mobileLogin) mobileLogin.style.display = "none";
        if (mobileProfile) mobileProfile.style.display = "block";
    } else {
        // User is logged out
        if (loginNav) loginNav.style.display = "block";
        if (profileNav) profileNav.style.display = "none";
        if (mobileLogin) mobileLogin.style.display = "block";
        if (mobileProfile) mobileProfile.style.display = "none";
    }
    // Refresh icons so the user icon shows up correctly
    if (window.lucide) lucide.createIcons();
  });

  // --- UI HELPERS (Popups & Spinners) ---
  const alertBox = document.getElementById("auth-alert");
  const showPopup = (message, type) => {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `auth-popup show ${type === "success" ? "popup-success" : "popup-error"
      }`;
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.classList.remove("show");
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 400);
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

  // --- LOGIN LOGIC (login.html) ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      setBtnLoading(true, "Sign In");
      try {
        await signInWithEmailAndPassword(auth, email, password);
        showPopup("Login Successful! Redirecting...", "success");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } catch (error) {
        setBtnLoading(false, "Sign In");
        showPopup("Login Failed: " + error.message, "error");
      }
    });
  }

  // --- REGISTRATION LOGIC (register.html) ---
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("fullname").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (password !== confirm)
        return showPopup("Passwords do not match!", "error");

      setBtnLoading(true, "Create Account");
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save User Name to Firestore
        await setDoc(doc(db, "users", user.uid), {
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

  // --- FORGOT PASSWORD LOGIC (forgot-password.html) ---
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;

      setBtnLoading(true, "Send Reset Link");
      try {
        await sendPasswordResetEmail(auth, email);
        showPopup("Success! Reset link sent to your email.", "success");
        setBtnLoading(false, "Send Reset Link");
      } catch (error) {
        setBtnLoading(false, "Send Reset Link");
        showPopup("Error: " + error.message, "error");
      }
    });
  }

  // --- LOGOUT LOGIC ---
  const logoutBtn = document.getElementById("logout-link");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth).then(() => (window.location.href = "index.html"));
    });
  }

  // --- SCROLL REVEAL ANIMATIONS ---
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
});
