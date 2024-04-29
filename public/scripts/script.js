
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector(".row g-3");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Voorkom standaard gedrag van het formulier

    const formData = new FormData(document.querySelector('.row g-3'));

    const email = formData.get("email");
    const password = formData.get("password");
    const address = formData.get("address");
    const address2 = formData.get("address2");
    const city = formData.get("city");
    const state = formData.get("state");
    const zip = formData.get("zip");
    const autoLogin = formData.get("autoLogin");

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
          address,
          address2,
          city,
          state,
          zip,
          autoLogin: autoLogin === "on", // Convert checkbox value to boolean
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Toon een melding met de respons van de server
      } else {
        throw new Error("Er is iets misgegaan bij het registreren.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Er is iets misgegaan bij het registreren.");
    }
  });
});
