import _ from 'lodash';
import modifyOnCopy from './modify_on_copy';

const longTypeAnnotation = '[jstype = JS_STRING]';

const typesOf64Bits = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'];
const rFieldWith64Bits = new RegExp(
  `(${typesOf64Bits.join('|')})\\s*\\S+\\s*=\\s*\\d+;`,
  'g'
);

/**
 * add type annotation for (u)int64 type
 */
export default function addTypeAnnotation(original: string, target: string) {
  return modifyOnCopy(original, target, (chunk: string, enc, callback) => {
    let line = chunk;
    // uint64 bigInt = 1  ---->  uint64 bigInt = 1 [jstype = JS_STRING];
    if (typesOf64Bits.some((item) => line.includes(item))) {
      // haven't been converted yet
      if (!line.includes('jstype')) {
        line = line.replace(rFieldWith64Bits, (match) => {
          return `${_.trimEnd(match, ';')} ${longTypeAnnotation};`;
        });
      }
    }

    callback(null, line);
  });
}
