// assets/scripts/auth.js
import { supabase } from "./supabaseClient.js";

/* ========= Toggle password visibility ========= */
function setupTogglePassword() {
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        btn.querySelector("i")?.classList.replace("bi-eye-slash", "bi-eye");
      } else {
        input.type = "password";
        btn.querySelector("i")?.classList.replace("bi-eye", "bi-eye-slash");
      }
    });
  });
}

/* ========= Navbar renderer ========= */
function renderAuthUI(user) {
  const slot = document.getElementById("authSection");
  if (!slot) return;

  if (user) {
    const name = user.user_metadata?.fullName || user.email;
    slot.innerHTML = `
      <span class="align-self-center me-2">Hello, <strong>${name}</strong></span>
      <button id="logoutBtn" class="btn btn-outline-danger">Logout</button>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      await supabase.auth.signOut();
    });
  } else {
    slot.innerHTML = `
      <a class="btn btn-outline-success" href="login.html">Login</a>
      <a class="btn btn-success text-white" href="register.html">Register</a>
    `;
  }
}

/* ========= Register ========= */
/* ========= Register ========= */
async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const fullName = document.getElementById("fullname")?.value?.trim() || "";
  const email = document.getElementById("email")?.value?.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    // 1️⃣ Register user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { fullName } }
    });

    if (error) {
      alert("Registration failed: " + error.message);
      return;
    }

    // 2️⃣ Directly log them in (no confirmation email)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      alert("Login failed: " + loginError.message);
      return;
    }

    // 3️⃣ Success → redirect
    alert(`Welcome, ${fullName || email}!`);
    form.reset();
    form.classList.remove("was-validated");
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("Unexpected error: " + (err.message || err));
  }
}

/* ========= Login ========= */
async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const email = document.getElementById("loginEmail")?.value?.trim();
  const password = document.getElementById("loginPassword")?.value;
  const rememberMe = document.getElementById("rememberMe")?.checked;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Incorrect email or password");
      return;
    }

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("userEmail", email);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("userEmail");
    }

    const { data: userData } = await supabase.auth.getUser();
    const name = userData?.user?.user_metadata?.fullName || "Farmer";
    alert(`Welcome back, ${name}!`);
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert("Unexpected login error");
  }
}

/* ========= Forgot Password ========= */
async function handleForgot(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const email = document.getElementById("forgotEmail")?.value.trim();
  if (!email) return;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset.html"
    });

    if (error) {
      alert("Error sending reset email: " + error.message);
    } else {
      alert("Password reset link sent! Check your email.");
      form.reset();
    }
  } catch (err) {
    console.error(err);
    alert("Unexpected error: " + (err.message || err));
  }
}

/* ========= Reset Password ========= */
async function handleReset(e) {
  e.preventDefault();
  const form = e.target;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const newPassword = document.getElementById("newPassword")?.value;
  const confirmNewPassword = document.getElementById("confirmNewPassword")?.value;

  if (newPassword !== confirmNewPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert("Failed to reset password: " + error.message);
    } else {
      alert("Password updated successfully. Please log in again.");
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error(err);
    alert("Unexpected reset error: " + (err.message || err));
  }
}

/* ========= Init ========= */
document.addEventListener("DOMContentLoaded", async () => {
  setupTogglePassword();

  // Restore session if reset link contains tokens
  if (window.location.hash.includes("access_token")) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        console.error("Failed to restore session:", error.message);
      } else {
        console.log("✅ Password reset session restored");
      }
    }
  }

  // Attach form handlers
  document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("forgotForm")?.addEventListener("submit", handleForgot);
  document.getElementById("resetForm")?.addEventListener("submit", handleReset);

  // Prefill remembered email
  if (localStorage.getItem("rememberMe") === "true" && document.getElementById("loginEmail")) {
    document.getElementById("loginEmail").value = localStorage.getItem("userEmail") || "";
    document.getElementById("rememberMe").checked = true;
  }

  // Render current session
  const { data: { session } } = await supabase.auth.getSession();
  renderAuthUI(session?.user || null);

  // Sync on changes
  supabase.auth.onAuthStateChange((_event, newSession) => {
    renderAuthUI(newSession?.user || null);
  });
});