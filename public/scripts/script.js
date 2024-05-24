document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".row g-3");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Voorkom standaard gedrag van het formulier

    const formData = new FormData(document.querySelector(".row g-3"));

    const email = formData.get("email");
    const password = formData.get("password");

    // Verstuur formuliergegevens naar de server via een POST-verzoek
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,

          autoLogin: autoLogin === "on", // Convert checkbox value to boolean
        }),
      });

      if (response.ok) {
        const data = await response.json();
        prompt(data.message);
      } else {
        throw new Error("Er is iets misgegaan bij het registreren.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Er is iets misgegaan bij het registreren.");
    }
  });
});
