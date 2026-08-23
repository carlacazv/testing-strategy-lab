export class HomePage {
  constructor(page) {
    this.page = page;
    this.brandHeading = page.getByRole('heading', { name: 'conduit', level: 1 });
    this.tagSidebar = page.getByText('Popular Tags', { exact: true });
    this.articleTitle = page.getByRole('heading', { name: 'Testing strategies with evidence' });
  }

  async goto() {
    await this.page.goto('/');
  }
}
