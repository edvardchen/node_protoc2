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
    const content = fs.readFileSync(target, { encoding: 'utf8' });
    expect(content).toContain('int64 id = 2 [jstype = JS_STRING];');
    expect(content).toContain('sint64 S64 = 4 [jstype = JS_STRING];');
    expect(content).toContain('fixed64 F64 = 5 [jstype = JS_STRING];');
    expect(content).toContain('sfixed64 SF64 = 6 [jstype = JS_STRING];');
  });
  it('long field in one line bracket', async () => {
    const target = tmp.fileSync().name;
    await addTypeAnnotation(
      path.resolve(__dirname, './fixtures/long_one_line_bracket.proto'),
      target
    );
    const content = fs.readFileSync(target, { encoding: 'utf8' });
    expect(content).toContain(
      '{ int64 id = 2 [jstype = JS_STRING]; sint64 foo = 3 [jstype = JS_STRING]; }'
    );
  });
});
