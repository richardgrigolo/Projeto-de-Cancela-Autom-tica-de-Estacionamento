import { App } from './App.js';
import { InterfaceUsuario } from './InterfaceUsuario.js';

const app = new App();
const ui = new InterfaceUsuario(app, app.persistencia);
await ui.iniciar();
