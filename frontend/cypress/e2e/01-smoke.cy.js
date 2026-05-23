describe("Member 1 - Smoke and Navigation Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
  });

  it("TC-01: should open home page successfully", () => {
    cy.visit("/");

    cy.contains(/GitHub Repo Manager|GitHub|Repo|Home/i).should("exist");
  });

  it("TC-02: should open login page successfully", () => {
    cy.visit("/login");

    cy.contains(/Developer Access|Login/i).should("exist");
    cy.contains(/Login with GitHub/i).should("exist");
    cy.contains(/Login with Token/i).should("exist");
  });

  it("TC-03: should open future plans page successfully", () => {
    cy.visit("/future-plans");

    cy.contains(/Future|Plans|Coming|Features/i).should("exist");
  });
});