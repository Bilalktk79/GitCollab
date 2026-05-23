describe("Member 3 - Admin Panel Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginWithGithubToken();
  });

  it("TC-07: should login as admin user", () => {
    cy.window().then((win) => {
      const username = win.localStorage.getItem("username");
      const role = win.localStorage.getItem("user_role");

      cy.log(`Logged in as: ${username}`);
      cy.log(`Role: ${role}`);

      expect(username).to.exist;
      expect(role).to.eq("admin");
    });
  });

  it("TC-08: should open admin dashboard", () => {
    cy.visit("/admin");

    cy.contains(/Admin|Dashboard/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-09: should open admin users page for monitoring users", () => {
    cy.visit("/admin/users");

    cy.contains(/User Management/i, {
      timeout: 10000,
    }).should("exist");

    cy.contains(/User/i).should("exist");
    cy.contains(/Email/i).should("exist");
    cy.contains(/Role/i).should("exist");
    cy.contains(/Status/i).should("exist");
  });
});