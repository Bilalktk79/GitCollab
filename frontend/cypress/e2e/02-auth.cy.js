describe("Member 2 - Authentication Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.visit("/login");
  });

  it("TC-04: should show error when GitHub token field is empty", () => {
    cy.contains("Login with Token").click();

    cy.contains(/Please enter GitHub token/i).should("exist");
  });

  it("TC-05: should reject invalid GitHub token", () => {
    cy.get('input[type="password"]').type("invalid_token_123");

    cy.contains("Login with Token").click();

    cy.contains(
      /Authentication Failed|Bad credentials|Login failed|Invalid|Unauthorized/i,
      {
        timeout: 10000,
      }
    ).should("exist");
  });

  it("TC-06: should login with valid GitHub token and save localStorage", () => {
    cy.loginWithGithubToken();

    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.exist;
      expect(win.localStorage.getItem("github_token")).to.exist;
      expect(win.localStorage.getItem("username")).to.exist;
      expect(win.localStorage.getItem("user_role")).to.exist;
    });
  });
});