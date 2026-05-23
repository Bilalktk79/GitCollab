describe("Member 4 - Admin Monitoring Module Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginAsAdmin();
  });

  it("TC-22: should open admin clients page", () => {
    cy.visit("/admin/clients");

    cy.contains(/Client|Access|Code|Revoke|Activate/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-23: should open admin commits page", () => {
    cy.visit("/admin/commits");

    cy.contains(/Commit|Status|Approve|Pending|Changes/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-24: should open admin logs page", () => {
    cy.visit("/admin/logs");

    cy.contains(/Log|Action|Admin|Activity/i, {
      timeout: 10000,
    }).should("exist");
  });
});