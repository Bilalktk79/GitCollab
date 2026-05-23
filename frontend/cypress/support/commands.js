Cypress.Commands.add("clearAppStorage", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

Cypress.Commands.add("loginWithGithubToken", () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  const githubPat = Cypress.env("GITHUB_PAT");

  if (!githubPat) {
    throw new Error(
      "GITHUB_PAT is missing. Run Cypress with CYPRESS_GITHUB_PAT=your_new_token"
    );
  }

  cy.request({
    method: "POST",
    url: `${apiBaseUrl}/api/auth/github/token-login`,
    body: {
      token: githubPat,
    },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(200);

    const data = response.body;

    expect(data).to.have.property("token");
    expect(data).to.have.property("github_token");
    expect(data).to.have.property("username");

    cy.visit("/");

    cy.window().then((win) => {
      win.localStorage.setItem("token", data.token);
      win.localStorage.setItem("github_token", data.github_token);
      win.localStorage.setItem("username", data.username);
      win.localStorage.setItem("user_role", data.role || "developer");
    });
  });
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.loginWithGithubToken();

  cy.window().then((win) => {
    const role = win.localStorage.getItem("user_role");
    expect(role, "Admin account PAT required").to.eq("admin");
  });
});