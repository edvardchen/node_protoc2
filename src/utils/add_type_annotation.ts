import _ from 'lodash';
import { TransformCallback } from 'stream';

const longTypeAnnotation = '[jstype = JS_STRING]';

const typesOf64Int = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'];
const rFieldWith64Bits = new RegExp(
  `(${typesOf64Int.join('|')})\\s*\\S+\\s*=\\s*\\d+;`,
  'g'
);

/**
 * add type annotation for (u)int64 type
 */
export default function addTypeAnnotation(
  chunk: string,
  enc: BufferEncoding,
  callback: TransformCallback
) {
  let line = chunk;
  // uint64 bigInt = 1  ---->  uint64 bigInt = 1 [jstype = JS_STRING];
  if (typesOf64Int.some((item) => line.includes(item))) {
    // haven't been converted yet
    if (!line.includes('jstype')) {
      line = line.replace(rFieldWith64Bits, (match) => {
        return `${_.trimEnd(match, ';')} ${longTypeAnnotation};`;
      });
    }
  }

  callback(null, line);
}
