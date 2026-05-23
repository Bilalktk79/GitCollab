describe("Admin Help and Notifications Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginAsAdmin();
  });

  it("TC-25: should open admin help posts page", () => {
    cy.visit("/admin/help");

    cy.contains(/Help|Post|Solved|Issue|Reply/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-26: should open notifications page", () => {
    cy.visit("/notifications");

    cy.contains(/Notification|Notifications|Unread|Read|Activity/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-27: should show admin navigation link", () => {
    cy.visit("/dashboard");

    cy.contains(/Admin/i, {
      timeout: 10000,
    }).should("exist");
  });
});