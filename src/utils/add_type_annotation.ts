import _ from 'lodash';
import modifyOnCopy from './modify_on_copy';

const longTypeAnnotation = '[jstype = JS_STRING]';

/**
 * add type annotation for (u)int64 type
 */
export default function addTypeAnnotation(original: string, target: string) {
  return modifyOnCopy(original, target, (chunk: string, enc, callback) => {
    let line = chunk;
    // uint64 bigInt = 1  ---->  uint64 bigInt = 1 [jstype = JS_STRING];
    if (line.includes('int64')) {
      // haven't been converted yet
      if (!line.includes('jstype')) {
        line = line.replace(/u?int64\s*\S+\s*=\s*\d+;/, (match) => {
          return `${_.trimEnd(match, ';')} ${longTypeAnnotation};`;
        });
      }
    }

    callback(null, line);
  });
}
