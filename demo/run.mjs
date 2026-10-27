import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createButtonController } from './scenario.mjs';
import { createMockLms } from './mock-lms.mjs';

const args = process.argv.slice(2);
const failAt = args.find((arg) => arg.startsWith('--fail='))?.slice(7);
if (args.some((arg) => arg !== '--double-press' && !arg.startsWith('--fail='))
  || (failAt !== undefined && !['check', 'upload', 'submit', 'verify'].includes(failAt))) {
  console.error('Запуск: node demo/run.mjs [--double-press] [--fail=check|upload|submit|verify]');
  process.exit(1);
}

try {
  const configUrl = new URL('./config.json', import.meta.url);
  const config = JSON.parse(await readFile(configUrl, 'utf8'));
  config.file = fileURLToPath(new URL(config.file, configUrl));

  console.log('DEMO: локальная имитация. Подключение к LMS отсутствует.');
  console.log(`Сценарий: ${config.scenario}`);
  console.log(`Задание: ${config.assignmentUrl}`);
  const controller = createButtonController({
    config,
    lms: createMockLms({ failAt }),
    send: (command) => console.log(`[ПК → кнопка] ${command}`),
    log: (message) => console.log(`[Сценарий] ${message}`),
  });

  console.log('[Кнопка → ПК] PRESS');
  const firstPress = controller.receive('PRESS');
  if (args.includes('--double-press')) {
    console.log('[Кнопка → ПК] PRESS (повторное нажатие)');
    await controller.receive('PRESS');
  }
  if (await firstPress === 'ERROR') process.exitCode = 1;
} catch (error) {
  console.error(`Не удалось запустить демонстрацию: ${error.message}`);
  process.exitCode = 1;
}
