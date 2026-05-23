describe("GitHub Repo Manager Smoke Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
  });

  it("should open home page", () => {
    cy.visit("/");
    cy.contains(/GitHub Repo Manager|GitHub|Repo/i).should("exist");
  });

  it("should open login page", () => {
    cy.visit("/login");

    cy.contains(/Developer Access/i).should("exist");
    cy.contains(/Login with GitHub/i).should("exist");
    cy.contains(/Login with Token/i).should("exist");
  });

  it("should open client access page", () => {
    cy.visit("/client-access");

    cy.contains(/Client|Access|Project/i).should("exist");
  });
});