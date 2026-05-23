describe("Member 1 - Repository Module Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginWithGithubToken();
  });

  it("TC-13: should open dashboard after login", () => {
    cy.visit("/dashboard");

    cy.contains(/Dashboard|Repositories|GitHub/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-14: should open repository view page", () => {
    cy.visit("/view");

    cy.contains(/Repositories|View|Repo|GitHub/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-15: should open create repository page", () => {
    cy.visit("/create");

    cy.contains(/Create|Repository|Repo/i, {
      timeout: 10000,
    }).should("exist");

    cy.get("input").should("exist");
  });
});