document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const root = document.documentElement;
  const themeToggles = [
    document.getElementById("theme-toggle"),
    document.getElementById("theme-toggle-mobile"),
  ];

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Refresh icons so Sun/Moon swap correctly
    lucide.createIcons();

    // Specific fix for the mobile button text/icon color update
    const mobileBtn = document.getElementById("theme-toggle-mobile");
    if (mobileBtn) {
      if (theme === "light") {
        mobileBtn.classList.remove("btn-outline-light");
        mobileBtn.classList.add("btn-outline-dark");
      } else {
        mobileBtn.classList.remove("btn-outline-dark");
        mobileBtn.classList.add("btn-outline-light");
      }
    }
  };

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);

  themeToggles.forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const newTheme =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(newTheme);
    });
  });

  // Intersection Observer for Scroll Reveal
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
});

// ------------------------------------------------------------------
// ------------------------------------------------------------------
// LOGIN PAGE SCRIPT
// ------------------------------------------------------------------
// ------------------------------------------------------------------

// Initialize Lucide
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const alertBox = document.getElementById("auth-alert");
  
  // Button Elements
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btnText");
  const btnSpinner = document.getElementById("btnSpinner");

  // --- Helper: Show Custom Popup ---
  const showPopup = (message, type) => {
    alertBox.textContent = message;
    alertBox.className = `auth-popup ${type === 'success' ? 'popup-success' : 'popup-error'}`;
    
    // 1. Make it block first
    alertBox.style.display = "block";
    
    // 2. Trigger animation after a tiny delay
    setTimeout(() => {
      alertBox.classList.add("show");
    }, 10);
    
    // 3. Hide after 3 seconds
    setTimeout(() => {
      alertBox.classList.remove("show");
      // 4. Set display: none once animation ends
      setTimeout(() => { alertBox.style.display = "none"; }, 400);
    }, 3000);
  };

  // --- Helper: Toggle Loading State ---
  const setLoading = (isLoading) => {
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.textContent = "Processing...";
      btnSpinner.style.display = "inline-block";
    } else {
      loginBtn.disabled = false;
      btnText.textContent = "Sign In";
      btnSpinner.style.display = "none";
    }
  };

  // --- Real-time Validation ---
  const validateField = (input, condition, errorId, message) => {
    const errorElement = document.getElementById(errorId);
    if (condition) {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      if (errorElement) errorElement.textContent = "";
      return true;
    } else {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      if (errorElement) errorElement.textContent = message;
      return false;
    }
  };

  emailInput.addEventListener("input", () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    validateField(emailInput, isValidEmail, "emailError", "Enter a valid email address");
  });

  passwordInput.addEventListener("input", () => {
    validateField(passwordInput, passwordInput.value.length >= 6, "passwordError", "Password must be at least 6 characters");
  });

  // --- Form Submission ---
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    const isPassValid = passwordInput.value.length >= 6;

    if (isEmailValid && isPassValid) {
      // Start Loading Animation
      setLoading(true);

      // Simulate a small delay for "Log in" processing
      setTimeout(() => {
        showPopup("Login Successful! Redirecting...", "success");
        
        // Final Redirection
        setTimeout(() => {
          window.location.href = "index.html"; 
        }, 1500);
      }, 1000); // 1 second "Processing" time
      
    } else {
      showPopup("Login Failed! Please enter correct credentials.", "error");
      validateField(emailInput, isEmailValid, "emailError", "Enter a valid email address");
      validateField(passwordInput, isPassValid, "passwordError", "Password must be at least 6 characters");
    }
  });

  // --- Theme Toggle Logic ---
  const themeToggle = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
});