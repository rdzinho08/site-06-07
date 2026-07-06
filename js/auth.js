const auth = {
    async login() {
        const u = document.getElementById('user-login').value.trim();
        const p = document.getElementById('pass-login').value;

        try {
            await api.login(u, p);
            document.getElementById('user-login').value = '';
            document.getElementById('pass-login').value = '';
            await this.check();
        } catch (error) {
            alert(error.message || 'Credenciais inválidas!');
        }
    },

    async logout() {
        try {
            await api.logout();
            await this.check();
            await app.updateCartCount();
        } catch (error) {
            console.error(error);
        }
    },

    async check() {
        const section = document.getElementById('auth-section');
        const loginContainer = document.getElementById('login-container');

        try {
            const data = await api.getMe();
            if (data.user) {
                section.innerHTML = `<span class="text-white me-2 small">Olá, <b>${data.user}</b></span><button class="btn btn-sm btn-danger" onclick="auth.logout()">Sair</button>`;
                if (loginContainer) {
                    loginContainer.style.display = 'none';
                }
            } else {
                section.innerHTML = `<button class="btn btn-sm btn-outline-light" onclick="auth.toggleLoginForm()">Login</button>`;
                if (loginContainer) {
                    loginContainer.style.display = 'none';
                }
            }
        } catch (error) {
            console.error(error);
            section.innerHTML = `<button class="btn btn-sm btn-outline-light" onclick="auth.toggleLoginForm()">Login</button>`;
        }
    },

    toggleLoginForm() {
        const el = document.getElementById('login-container');
        if (!el) {
            return;
        }
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await auth.check();
});