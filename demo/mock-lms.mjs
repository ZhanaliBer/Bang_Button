import { setTimeout as delay } from 'node:timers/promises';

// Только имитация: браузер и сеть не используются, файлы никуда не отправляются.
export function createMockLms({ failAt, delayMs = 250 } = {}) {
  let assignmentUrl;
  let uploaded = false;
  let submitted = false;

  async function step(name) {
    await delay(delayMs);
    if (failAt === name) throw new Error(`Имитация сбоя на этапе ${name}.`);
  }

  return {
    async checkAssignment(url) {
      await step('check');
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || parsed.hostname !== 'lms.astanait.edu.kz'
        || parsed.pathname !== '/mod/assign/view.php' || !parsed.searchParams.get('id')) {
        throw new Error('Ожидается ссылка на задание LMS AITU.');
      }
      assignmentUrl = url;
      uploaded = false;
      submitted = false;
    },
    async uploadFile(file) {
      await step('upload');
      if (!assignmentUrl || !file) throw new Error('Задание или файл не выбран.');
      uploaded = true;
    },
    async submit() {
      await step('submit');
      if (!uploaded) throw new Error('Файл ещё не прикреплён.');
      submitted = true;
    },
    async verifySubmission() {
      await step('verify');
      return { assignmentUrl, status: submitted ? 'submitted' : 'draft' };
    },
  };
}
