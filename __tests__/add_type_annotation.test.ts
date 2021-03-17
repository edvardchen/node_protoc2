import addTypeAnnotation from '../src/utils/add_type_annotation';
import path from 'path';
import tmp from 'tmp';
import fs from 'fs';

describe('add type annotation', () => {
  it('long field', async () => {
    const target = tmp.fileSync().name;
    await addTypeAnnotation(
      path.resolve(__dirname, './fixtures/long.proto'),
      target
    );
    expect(fs.readFileSync(target, { encoding: 'utf8' })).toContain(
      'int64 id = 2 [jstype = JS_STRING];'
    );
  });
  it('long field in one line bracket', async () => {
    const target = tmp.fileSync().name;
    await addTypeAnnotation(
      path.resolve(__dirname, './fixtures/long_one_line_bracket.proto'),
      target
    );
    expect(fs.readFileSync(target, { encoding: 'utf8' })).toContain(
      'message HelloRequest { int64 id = 2 [jstype = JS_STRING]; }'
    );
  });
});
