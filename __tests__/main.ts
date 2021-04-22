import path from 'path';
import compile from '../src';

describe('node_protoc_2', () => {
  const fixturePath = path.resolve(__dirname, './fixtures');
  it('compile long field into string type', async () => {
    await compile({
      proto_files: [path.resolve(fixturePath, './greeter.proto')],
      proto_paths: [fixturePath],
      out_dir: fixturePath + '/.generated',
    });
  });

  it('proto import another', async () => {
    await compile({
      proto_files: [path.resolve(fixturePath, './complex.proto')],
      proto_paths: [fixturePath],
      out_dir: fixturePath + '/.generated',
    });
  });
});
