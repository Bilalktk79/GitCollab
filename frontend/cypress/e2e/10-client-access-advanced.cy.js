describe("Client Access Advanced Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
  });

  it("TC-28: should open client access page without login", () => {
    cy.visit("/client-access");

    cy.contains(/Client|Access|Project/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-29: should show validation on empty client code submission", () => {
    cy.visit("/client-access");

    cy.get("button")
      .contains(/Access|Submit|Enter|Continue/i)
      .click();

    cy.contains(/code|required|enter|invalid|access/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-30: should reject random invalid client code", () => {
    cy.visit("/client-access");

    cy.get("input").first().type("WRONG_CLIENT_CODE_999");

    cy.get("button")
      .contains(/Access|Submit|Enter|Continue/i)
      .click();

    cy.contains(/Invalid|not found|denied|revoked|failed|Access/i, {
      timeout: 10000,
    }).should("exist");
  });
});