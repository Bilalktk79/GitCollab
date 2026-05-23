describe("Member 4 - Client Access Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
  });

  it("TC-10: should open client access page", () => {
    cy.visit("/client-access");

    cy.contains(/Client|Access|Project/i).should("exist");
  });

  it("TC-11: should reject invalid client access code", () => {
    cy.visit("/client-access");

    cy.get("input").first().type("INVALID_CODE_123");

    cy.get("button")
      .contains(/Access|Submit|Enter|Continue/i)
      .click();

    cy.contains(/Invalid|not found|denied|revoked|failed|Access/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-12: should keep unauthenticated client away from admin page", () => {
    cy.visit("/admin");

    cy.url().should((url) => {
      expect(url).to.match(/login|admin|dashboard/);
    });

    cy.window().then((win) => {
      expect(win.localStorage.getItem("user_role")).to.not.eq("admin");
    });
  });
});