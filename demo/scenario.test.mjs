import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createButtonController } from './scenario.mjs';
import { createMockLms } from './mock-lms.mjs';

const config = {
  scenario: 'submit-homework',
  assignmentUrl: 'https://lms.astanait.edu.kz/mod/assign/view.php?id=DEMO',
  file: fileURLToPath(new URL('./fixtures/homework.txt', import.meta.url)),
};

function setup(lms = createMockLms({ delayMs: 0 }), settings = config) {
  const signals = [];
  const controller = createButtonController({
    config: settings, lms, send: (signal) => signals.push(signal), log: () => {},
  });
  return { controller, signals };
}

test('Одновременные нажатия запускают только одну сдачу', async () => {
  const { controller, signals } = setup();
  const first = controller.receive('PRESS');
  assert.equal(await controller.receive('PRESS'), 'BUSY');
  assert.equal(await first, 'SUCCESS');
  assert.deepEqual(signals, ['BUSY', 'SUCCESS']);
});

test('Сбой загрузки не запускает отправку, после ошибки можно повторить', async () => {
  let uploads = 0;
  let submits = 0;
  const lms = createMockLms({ delayMs: 0 });
  const upload = lms.uploadFile;
  const submit = lms.submit;
  lms.uploadFile = async (file) => {
    if (++uploads === 1) throw new Error('Временный сбой');
    return upload(file);
  };
  lms.submit = async () => { submits++; return submit(); };
  const { controller, signals } = setup(lms);
  assert.equal(await controller.receive('PRESS'), 'ERROR');
  assert.equal(submits, 0);
  assert.equal(await controller.receive('PRESS'), 'SUCCESS');
  assert.equal(submits, 1);
  assert.deepEqual(signals, ['BUSY', 'ERROR', 'BUSY', 'SUCCESS']);
});

test('Черновик или подтверждение другого задания не считаются успехом', async () => {
  for (const receipt of [
    { status: 'draft', assignmentUrl: config.assignmentUrl },
    { status: 'submitted', assignmentUrl: `${config.assignmentUrl}-OTHER` },
  ]) {
    const lms = createMockLms({ delayMs: 0 });
    lms.verifySubmission = async () => receipt;
    const { controller, signals } = setup(lms);
    assert.equal(await controller.receive('PRESS'), 'ERROR');
    assert.deepEqual(signals, ['BUSY', 'ERROR']);
  }
});

test('При отсутствии файла LMS не вызывается', async () => {
  let called = false;
  const { controller } = setup(
    { checkAssignment: async () => { called = true; } },
    { ...config, file: `${config.file}.missing` },
  );
  assert.equal(await controller.receive('PRESS'), 'ERROR');
  assert.equal(called, false);
});
