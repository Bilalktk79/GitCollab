describe("Member 3 - Collaboration Module Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginWithGithubToken();
  });

  it("TC-19: should open Help Room page", () => {
    cy.visit("/help");

    cy.contains(/Help|Room|Issue|Post|Developer|GitHub Repo Manager/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-20: should show Help Room navigation for logged-in user", () => {
    cy.visit("/dashboard");

    cy.contains(/Help Room|Help/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-21: should open Chat page", () => {
    cy.visit("/chat");

    cy.contains(/Chat|Message|Conversation|Client|Developer|GitHub Repo Manager/i, {
      timeout: 10000,
    }).should("exist");
  });
});