export class LoginPage {
  constructor(page) {
    this.page = page;
    this.email = page.getByPlaceholder('Email');
    this.password = page.getByPlaceholder('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('/#/login');
  }

  async login({ email, password }) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
