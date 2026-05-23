describe("Member 2 - Upload and Commit Review Tests", () => {
  beforeEach(() => {
    cy.clearAppStorage();
    cy.loginWithGithubToken();
  });

  it("TC-16: should open upload file page", () => {
    cy.visit("/upload");

    cy.contains(/Upload|File|Repository|Commit/i, {
      timeout: 10000,
    }).should("exist");
  });

  it("TC-17: should show upload form fields", () => {
    cy.visit("/upload");

    cy.get("input, textarea, select", {
      timeout: 10000,
    }).should("exist");

    cy.contains(/Commit|Message|File|Path|Branch|Upload/i).should("exist");
  });

  it("TC-18: should open commit review center", () => {
    cy.visit("/commits");

    cy.contains(/Commit|Review|Center|Status|Pending|Approved/i, {
      timeout: 10000,
    }).should("exist");
  });
});