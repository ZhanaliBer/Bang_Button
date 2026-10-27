import { stat } from 'node:fs/promises';

// Адаптер LMS можно заменить, не меняя обработку физической кнопки.
export function createButtonController({ config, lms, send, log }) {
  let running = false;

  return {
    async receive(command) {
      if (command.trim() !== 'PRESS') return 'IGNORED';
      if (running) {
        log('Повторное нажатие пропущено: сценарий уже выполняется.');
        return 'BUSY';
      }

      running = true;
      try {
        send('BUSY');
        if (config.scenario !== 'submit-homework') {
          throw new Error('Неизвестный сценарий.');
        }
        const file = await stat(config.file);
        if (!file.isFile() || file.size === 0) {
          throw new Error('Нужен непустой файл домашнего задания.');
        }

        log('Файл найден. Проверяем вкладку и выбранное задание.');
        await lms.checkAssignment(config.assignmentUrl);
        log('Прикрепляем файл.');
        await lms.uploadFile(config.file);
        log('Выполняем окончательную отправку.');
        await lms.submit();
        log('Проверяем подтверждение сдачи.');
        const receipt = await lms.verifySubmission();
        if (receipt.status !== 'submitted' || receipt.assignmentUrl !== config.assignmentUrl) {
          throw new Error('Нет подтверждения сдачи выбранного задания.');
        }

        send('SUCCESS');
        return 'SUCCESS';
      } catch (error) {
        log(`Ошибка: ${error.message}`);
        send('ERROR');
        return 'ERROR';
      } finally {
        running = false;
      }
    },
  };
}
