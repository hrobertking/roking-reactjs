/**
 * @author H Robert King <hrobertking@cathmhaol.com>
 * @description Language pack for the accessible video player.
 *
 * @type {object}
 * @property {object} (*) - BCP-47 code
 * @property {string} (*).name - language name, e.g., English or Español
 * @property {string} (*).unsupported - Your browser does not support HTML5 videos
 * @property {string[]} (*).captions - ['CC Off', 'CC On']
 * @property {string} (*).forward - Forward
 * @property {string[]} (*).fullscreen - ['Full Screen Off', 'Full Screen']
 * @property {string} (*).pause - Pause
 * @property {string} (*).play - Play
 * @property {string} (*).rewind - Rewind
 * @property {string} (*).stop - Stop
 */
export default {
  en: {
    name: 'English',
    unsupported: 'Your browser does not support HTML5 videos',
    captions: ['CC Off', 'CC On'],
    forward: 'Forward',
    fullscreen: ['Full Screen Off', 'Full Screen'],
    play: ['Pause', 'Play'],
    rewind: 'Rewind',
    stop: 'Stop',
    time: 'Time',
    volume: 'Volume',
  },
  es: {
    name: 'Español',
    unsupported: 'Su navegador no soporta videos en HTML5',
    captions: ['Sin subtítulos', 'Subtítulos'],
    forward: 'Avanzar',
    fullscreen: ['Pantalla Pequeña', 'Pantalla Completa'],
    play: ['Pausa', 'Reproducir'],
    rewind: 'Retroceder',
    stop: 'Detener',
    time: 'Ahora',
    volume: 'Volumen',
  },
};
